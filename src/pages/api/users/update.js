const ldap = require('ldapjs');
import { addUser } from '../../../database/dbOps';

export default function handler(req, response) {
  try {
    const client = ldap.createClient({
      url: [process.env.LDAP_IP_1, process.env.LDAP_IP_2],
    });

    client.bind(process.env.LDAP_USER, process.env.LDAP_PW, (err) => {
      if (err) throw `Bind Error : ${err}`;
    });

    const opts = {
      // filter: `(&(objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=bilesim,DC=net,DC=tr)(${req.body.filter}))`,
      // filter: `${req.body.filter}`,
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
        // console.log("status: " + result);

        if (result.status !== 0) throw `LDAP Error: ${result.errorMessage}`;

        const joinArray = (array) =>
          typeof array == 'object' ? array.join() : array;

        const userData = ldapData.map((user) => {
          if (user.mail === null || user.mail === undefined) return;
          if (user.manager === undefined) return;
          if (user.sAMAccountName === 'murhak') return;

          return {
            username: user.sAMAccountName,
            display_name: user.name || null,
            mail: user.mail,
            // is_manager: Boolean(user.directReports),
            is_manager: Boolean(user.manager.includes('OU=Genel Mud. Yrd.')),
            is_hr: Boolean(user.description === 'İnsan Kaynakları Bölümü'),
            user_dn: user.dn || null,
            title: user.title || null,
            description: user.description || null,
            physicalDeliveryOfficeName: user.physicalDeliveryOfficeName || null,
            memberOf: joinArray(user.memberOf) || null,
            department: user.department || null,
            directReports: joinArray(user.directReports) || null,
            manager_dn: user.manager || null,
          };
        });

        const filteredData = userData.filter((user) => user !== undefined);

        filteredData.forEach((user) => addUser(user));

        response.status(200).json({
          success: true,
          message: 'Tüm kullanıcı bilgileri güncellendi.',
          ldapData,
        });
      });
    });
  } catch (err) {
    console.error('CAUGHT ERROR: ' + err);
    response.status(200).json({
      success: false,
      message: err,
    });
  }
}
