const bcrypt = require("bcryptjs");

async function generate() {
  const superadmin = await bcrypt.hash("08212328", 10);
  const moderator = await bcrypt.hash("50070435", 10);

  console.log("Superadmin:", superadmin);
  console.log("Moderator:", moderator);
}

generate();