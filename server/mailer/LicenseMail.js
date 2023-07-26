const Mail = require("./Mail");

class LicenseMail extends Mail {
  constructor(subject, content, license, carbon_copy = null) {
    // console.log(feedback);
    const emailContent = `
                Dear ${license.user_name},<br/><br/>
                ${content}<br/>
            `;
    super(license.user_email, subject, emailContent, carbon_copy);
  }
}

class ExpireLicenseMail extends LicenseMail {
  constructor(license, carbon_copy = null) {
    const emailContent = `
            <strong>${license.license_name}</strong> from <strong>${license.license_provider}
            </strong> for <strong>${license.asset_name}</strong> <br/>
            at <strong>${license.plant_name} ${license.plant_loc} </strong>
            has <strong>Expired</strong>.
        `;

    super("License Expired", emailContent, license, carbon_copy);
  }
}

class ReminderLicenseMail extends LicenseMail {
  constructor(license, carbon_copy = null) {
    const emailContent = `
              <strong>${license.license_name}</strong> from <strong>${
      license.license_provider
    }</strong> for 
              <strong>${license.asset_name}</strong> <br/> 
              at <strong>${license.plant_name} ${license.plant_loc} </strong>
              is expiring ${
                license.age.days <= 0
                  ? "<strong>Today</strong>"
                  : `in <strong>${license.age.days} Days</strong>.`
              }
          `;

    super("License Expiry", emailContent, license, carbon_copy);
  }
}

module.exports = {
  ExpireLicenseMail,
  ReminderLicenseMail,
};
