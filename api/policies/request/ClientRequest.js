

// Define the language object
const { validateFields, purify } = require('../../../api/services/Validate');

module.exports = async function (req, res, next) {


  const rules = {
    name: 'required|lengthMin:4|lengthMax:50',
    description: 'required|string|lengthMax:50',
  };

  purify(req);
  const errors = validateFields(req, rules);


  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ errors });
  }

  return next();
};
