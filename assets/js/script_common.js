const paramsTable = {
  basePath: null,
  perPage: 25,
  search: '',
  sort: null
}

document.addEventListener("DOMContentLoaded", () => {

  // componente para ordenar registros en la tabla.
  const orderFields = document.querySelectorAll('strong.orderField');
  var allArrows = document.querySelectorAll('span.arrows');

  orderFields.forEach(orderField => {

    const spans = orderField.querySelectorAll('span');

    spans.forEach((span, index) => {

      let currentIndex = index;

      span.addEventListener('click', () => {


        spans[index].classList.add('d-none');

        allArrows.forEach((arrow) => {
          arrow.classList.add('d-none');
        });
        orderFields.forEach((arrow) => {
          const spans = arrow.querySelectorAll('span');
          spans[0].classList.remove('d-none');
        });

        currentIndex = ((index + 1) >= spans.length) ? 0 : (index + 1);

        if (currentIndex != 0)
          spans[0].classList.add('d-none');

        spans[currentIndex].classList.remove('d-none');
        let field = spans[currentIndex].getAttribute('field');
        let sort = spans[currentIndex].getAttribute('sort');
        paramsTable['sort'] = (field != null) ? `${field} ${sort}`:'';
        getResultsTable();
      });
    });
  });
});

function getResultsTable() {
  if (paramsTable.sort) {
    window.location.href = `${paramsTable.basePath}?page=1&perPage=${paramsTable.perPage}&search=${paramsTable.search}&sort=${paramsTable.sort}`;
  } else {
    window.location.href = `${paramsTable.basePath}?page=1&perPage=${paramsTable.perPage}&search=${paramsTable.search}`;
  }
}

function limpiarInput(input) {

  input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  input = input.replace(/on\w+="[^"]+"/gi, '');

  input = input.replace(/<\/?[^>]+>/gi, '');

  input = input.replace(/=[\s]*(['"])(javascript:[^'"]+)(['"])/gi, '');

  input = input.replace(/url[\s]*\((['"]?)(javascript:[^'"\)]+)(['"]?)\)/gi, '');

  return input;
}

function validarEmail(email) {

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
}


