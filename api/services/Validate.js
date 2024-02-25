const langList = sails.config.i18n.formRequest;

module.exports = {
  validateFields: function (req, rules) {

    const errors = {};
    let lang = req.me.lang;
    !langList.includes(lang) ? lang = langList[0] : '';

    const language = require('../../config/locales/formRequest/' + lang);

    Object.keys(rules).forEach((field) => {
      const fieldRules = rules[field].split('|');
      fieldRules.forEach((rule) => {
        const [ruleName, ...params] = rule.split(':');

        if (ruleName !== undefined && language[ruleName]) {
          if (req.body[field] !== undefined && ruleName !== 'required' && ruleName !== 'fileRequired') {
            try {
              let isValid;

              if (ruleName === 'number') {
                isValid = !isNaN(Number(req.body[field]));
              } else if (ruleName === 'min') {
                isValid = req.body[field] >= parseInt(params[0]);
              } else if (ruleName === 'max') {
                req.body[field] = req.body[field].toString();
                isValid = req.body[field] <= parseInt(params[0]);
              } else if (ruleName === 'string') {
                isValid = typeof req.body[field] === 'string';
              } else if (ruleName === 'lengthMin') {
                req.body[field] = req.body[field].toString();
                isValid = req.body[field].trim().length >= parseInt(params[0]);
              } else if (ruleName === 'lengthMax') {
                req.body[field] = req.body[field].toString();
                isValid = req.body[field].trim().length <= parseInt(params[0]);
              } else if (ruleName === 'isEmail') {
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = regexEmail.test(req.body[field]);
              } else if (ruleName === 'array') {
                isValid = Array.isArray(req.body[field]);
              } else if (ruleName === 'arrayMin') {
                isValid = Array.isArray(req.body[field]) && req.body[field].length >= parseInt(params[0]);
              } else if (ruleName === 'arrayMax') {
                isValid = Array.isArray(req.body[field]) && req.body[field].length <= parseInt(params[0]);
              } else if (ruleName === 'isFile' || ruleName === 'mime' || ruleName === 'size' || ruleName === 'sizeMax') {
                isValid = req._fileparser && req._fileparser.upstreams && req._fileparser.upstreams.some(upstream => upstream.fieldName === field);
              } else {
                throw 'no_valid';
              }

              if (!isValid) {
                !errors[field] ? errors[field] = [] : '';
                errors[field].push(language[ruleName].replace('{field}', field).replace('{params}', params[0] || ''));
              }

            } catch (e) {
              console.error('error validate', typeof e);
              (!errors[field]) ? errors[field] = [] : '';
              errors[field].push(language['no_valid'].replace('{field}', field).replace('{ruleName}', ruleName).replace('{params}', params[0] || ''));
            }

          } else {

            let isFile = req._fileparser && req._fileparser.upstreams && req._fileparser.upstreams.some(upstream => upstream.fieldName === field);

            if (ruleName === 'required') {
              if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {

                (!errors[field]) ? errors[field] = [] : '';
                errors[field].push(language[ruleName].replace('{field}', field));
              }
            } else if (!isFile && (ruleName === 'fileRequired' || ruleName === 'isFile' || ruleName === 'mime' || ruleName === 'sizeMax')) {

              (!errors[field]) ? errors[field] = [] : '';
              errors[field].push(language[ruleName].replace('{field}', field));
            }

            try {

              if (isFile) {
                let fileValid = true;

                if (ruleName === 'mime') {
                  let upstream = req._fileparser.upstreams.find(upstream => upstream.fieldName === field);
                  let mimeTypes = params[0].split(',');
                  let fileMime = upstream._files[0].stream.headers['content-type'].split('/');
                  fileMime = fileMime[1] || fileMime[0];
                  fileValid = mimeTypes.some(mimeType => fileMime.includes(mimeType));

                } else if (ruleName === 'sizeMax') {
                  let upstream = req._fileparser.upstreams.find(upstream => upstream.fieldName === field);
                  if (upstream) {
                    let fileSize = upstream._files[0].stream.byteCount;
                    // KB to bytes
                    let maxSize = parseInt(params[0]) * 1024;

                    fileValid = fileSize <= maxSize;
                  }
                }

                if (!fileValid) {
                  (!errors[field]) ? errors[field] = [] : '';
                  errors[field].push(language[ruleName].replace('{field}', field).replace('{params}', params[0] || ''));
                }
              }

            } catch (e) {
              console.error('error validate', typeof e);
              (!errors[field]) ? errors[field] = [] : '';
              errors[field].push(language['no_valid'].replace('{field}', field).replace('{ruleName}', ruleName).replace('{params}', params[0] || ''));
            }
          }
        }

      });
    });

    return errors;

  },
  purify: function (req) {
    Object.keys(req.body).forEach((field) => {
      if (typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    });
  },
};
