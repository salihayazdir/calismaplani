const ldap = require("ldapjs");

export default function handler(req, res) {
  try {
    const client = ldap.createClient({
      url: [process.env.LDAP_IP_1, process.env.LDAP_IP_2],
    });

    client.bind(process.env.LDAP_USER, process.env.LDAP_PW, (err) => {
      if (err) throw `Bind Error : ${err}`;
    });

    const opts = {
      filter: "cn=Tuncay Ötümlü",
      scope: "sub",
      // attributes: ['dn', 'sn', 'cn']
    };

    client.search("OU=BILESIM,DC=bilesim,DC=net,DC=tr", opts, (err, res) => {
      if (err) throw `Search Error : ${err}`;

      res.on("searchRequest", (searchRequest) => {
        console.log("searchRequest: ", searchRequest.messageID);
      });

      res.on("searchEntry", (entry) => {
        console.log("entry: " + JSON.stringify(entry.object));
      });

      res.on("searchReference", (referral) => {
        console.log("referral: " + referral.uris.join());
      });

      res.on("error", (err) => {
        console.error("error: " + err.message);
      });

      res.on("end", (result) => {
        client.unbind((err) => {
          if (err) throw `Unbind Error : ${err}`;
        });
        console.log("status: " + result.status);
      });
    });
  } catch (err) {
    console.error("CAUGHT ERROR: " + err);
  }

  res.status(200).json({ test: "ok" });
}
