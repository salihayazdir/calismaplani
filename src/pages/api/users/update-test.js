const ldap = require('ldapjs');
import { addUser, setUsersInactive } from '../../../database/dbOps';

export default async function handler(req, response) {
  try {
    const client = ldap.createClient({
      url: [process.env.LDAP_IP_1, process.env.LDAP_IP_2],
    });

    client.bind(process.env.LDAP_USER, process.env.LDAP_PW, (err) => {
      // if (err) throw `LDAP Bind Error : ${err}`;
      if (err) {
        console.error('Hata: ' + err);
        response.status(200).json({
          success: false,
          message: `LDAP Bind Error : ${err}`,
        });
      }
    });

    const opts = {
      filter: `objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=bilesim,DC=net,DC=tr`,
      scope: 'sub',
      attributes: [
        'dn',
        'cn',
        'title',
        'description',
        'physicalDeliveryOfficeName',
        'memberOf',
        'department',
        'directReports',
        'name',
        'sAMAccountName',
        'managedObjects',
        'objectCategory',
        'mail',
        'manager',
      ],
    };

    client.search('OU=BILESIM,DC=bilesim,DC=net,DC=tr', opts, (err, res) => {
      if (err) throw `Search Error : ${err}`;

      const ldapData = [];

      res.on('searchRequest', (searchRequest) => {
        // console.log("searchRequest: ", searchRequest.messageID);
      });

      res.on('searchEntry', (entry) => {
        // console.log("entry: " + JSON.stringify(entry.object));
        ldapData.push(entry.object);
      });

      res.on('searchReference', (referral) => {
        // console.log("referral: " + referral.uris.join());
      });

      res.on('error', (err) => {
        throw err;
      });

      res.on('end', async (result) => {
        client.unbind((err) => {
          if (err) throw `Unbind Error : ${err}`;
        });

        if (result.status !== 0) throw `LDAP Error: ${result.errorMessage}`;

        const setUsersInactiveResult = await setUsersInactive();
        if (!setUsersInactiveResult) throw 'User update error.';

        const joinArray = (array) =>
          typeof array == 'object' ? array.join() : array;

        const userData = ldapData.map((user) => {
          if (user.mail === null || user.mail === undefined) return;

          let isManager = false;
          if (user.manager !== undefined)
            isManager = Boolean(user.manager.includes('OU=Genel Mud. Yrd.'));

          ////// GENEL MÜDÜRE BAĞLI YÖNETİCİLER /////
          const managerExceptions = ['endavc', 'omeung', 'selkat'];
          if (managerExceptions.indexOf(user.sAMAccountName) !== -1)
            isManager = true;
          ////// GENEL MÜDÜRE BAĞLI YÖNETİCİLER /////

          let isHr = false;
          if (
            user.dn.includes('OU=Genel Mud. Yrd.') ||
            user.sAMAccountName === 'murhak' ||
            user.description === 'İnsan Kaynakları Bölümü'
          )
            isHr = true;

          return {
            username: user.sAMAccountName,
            display_name: user.name || null,
            mail: user.mail,
            is_manager: isManager,
            is_hr: isHr,
            user_dn: user.dn || null,
            title: user.title || null,
            description: user.description || null,
            physicalDeliveryOfficeName: user.physicalDeliveryOfficeName || null,
            memberOf: joinArray(user.memberOf) || null,
            department: user.department || null,
            directReports: joinArray(user.directReports) || null,
            manager_dn: user.manager || null,
            is_active: true,
          };
        });

        const filteredData = userData.filter((user) => user !== undefined);

        const dbResults = filteredData.map(async (user) => await addUser(user));
        const results = await Promise.allSettled(dbResults);

        const message = () => {
          const totalLength = results.length;
          const errorlength = results.filter(
            (result) => result.value.returnValue !== 0
          ).length;
          const successLength = totalLength - errorlength;
          if (errorlength === 0)
            return `${successLength} kullanıcı başarıyla güncellendi.`;

          if (errorlength === totalLength) return false;

          return `${successLength} kullanıcı başarıyla güncellendi. ${errorlength} kullanıcı güncellenirken hata oluştu.`;
        };

        if (message() === false) throw 'Kullanıcılar güncellenemedi.';

        response.status(200).json({
          success: true,
          message: message(),
          ldapData,
        });
      });
    });
  } catch (err) {
    console.error('Hata: ' + err);
    response.status(200).json({
      success: false,
      message: err,
    });
  }
}