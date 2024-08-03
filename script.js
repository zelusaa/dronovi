"use strict";
// Poneze nema dostatacno vreme za vsicko kato aprkosimacija vzeto e da v svak sklad ima tocno mnogo dronove koite tip kmetat moze da odbere pri pridavaneto na sklada v mapata
const typeOfDrones = [
  {
    capacity: 500,
    consumption: 1,
  },
  {
    capacity: 1000,
    consumption: 3,
  },
  {
    capacity: 2000,
    consumption: 5,
  },
];
const output = {
  poweredOn: true,
  minutes: {
    program: 10,
    real: 400,
  },
};

/*---------Add number of products------ */
const divNumberProducts = document.querySelector(
  ".select--number--of--products"
);
const selectElement = document.getElementById("products");
selectElement.addEventListener("change", function (e) {
  e.preventDefault();
  Array.from(selectElement.selectedOptions).forEach((option) => {
    const label = document.createElement("label");
    label.textContent = `Number of ${option.value}: `;
    const input = document.createElement("input");
    input.type = "number";
    input.classList.add("brojProizvodite");
    input.name = option.value + "-kolicina";
    divNumberProducts.appendChild(label);
    divNumberProducts.appendChild(input);
    divNumberProducts.appendChild(document.createElement("br"));
  });
});
/*--------------------- */
const formata = document.querySelector(".form--final");
const displayBtn = document.querySelector(".display--btn");
const divRezultatite = document.querySelector(".results--div");
const townFormata = document.querySelector(".town--form");
const productFormata = document.querySelector(".product--form");
const custFormata = document.querySelector(".customer--form");
const skladFormata = document.querySelector(".sklad--form");
class App {
  id = 1;
  #dataAPP = { warehouses: [], products: [], customers: [], typesOfDrones: [] };
  #arrayOfOrders = [];
  vremeZarezdane = 0;
  #arrayOfSuccesDel = [];
  #arrayOfRejectedDeliveries = [];
  totalnotoVreme = 0;
  constructor() {
    formata.addEventListener("submit", this.submitForm.bind(this));
    displayBtn.addEventListener("click", this.displayResults.bind(this));
    townFormata.addEventListener("submit", this.addTownCord.bind(this));
    productFormata.addEventListener("submit", this.addProduct.bind(this));
    custFormata.addEventListener("submit", this.addCustomer.bind(this));
    skladFormata.addEventListener("submit", this.addWareHouse.bind(this));
  }
  submitForm(e) {
    e.preventDefault();
    const simulacionoVreme = output.minutes.real / output.minutes.program;
    const customerID = this.#dataAPP.customers.filter((val) => {
      return val.name === document.querySelector("#customer").value;
    })[0].id;
    const sklad = document.querySelector("#warehouse").value;
    const odabir = Array.from(
      document.querySelectorAll(".brojProizvodite")
    ).map((val) => val.name);
    const productListata = {};
    odabir.forEach((val) => {
      const imetoNaProizvoda = val.split("-")[0];
      const quantiy = parseInt(
        document.querySelector(`input[name = "${val}"]`).value
      );
      productListata[imetoNaProizvoda] = quantiy;
    });
    // Proveri da li dron od sklada e dostatacno zareden ako ne porckata se otkazva
    const porcka = new Order(customerID, productListata, sklad, this.#dataAPP);
    //console.log(porcka.warehouse);
    // Proveri da li dron od sklada e dostatacno zareden ako ne porckata se otkazva
    const appropriateSklad = this.#dataAPP.warehouses.find(
      (sklad) => sklad.name === porcka.warehouse
    );
    /*--------Za-domasno-2 */

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //this.#arrayOfOrders.push(porcka);
    if (
      appropriateSklad.dron.capacity >
      porcka.time * appropriateSklad.dron.consumption
    ) {
      /*---------Namali zaredenosta na drona */

      appropriateSklad.dron.capacity -=
        porcka.time * appropriateSklad.dron.consumption;
      porcka.status = "Products delivered";
      this.#arrayOfSuccesDel.push(porcka);
      setTimeout(function () {
        console.log(
          `Order to customer with id ${porcka.customerId} is delivered in ${porcka.time}`
        );
      }, simulacionoVreme);

      ////////////////////
    } else {
      //alert(
      //  "You can not order from selected warehouse, because we do not have available dron, please select another warehouse"
      //);
      if (
        appropriateSklad.dron.capacity <
        typeOfDrones.find(
          (item) => item.consumption === appropriateSklad.dron.consumption
        ).capacity //Ako tozi uslov ne e veren selected skladt e dalec za dostavka do tozi potrebitel
      ) {
        console.log("You can not order from this warehouse");
      } else {
        appropriateSklad.dron.capacity = typeOfDrones.find(
          (item) => item.consumption === appropriateSklad.dron.consumption
        ).capacity;
        porcka.status = "Rejected";
        porcka.time = NaN;
        this.#arrayOfRejectedDeliveries.push(porcka);

        console.log(
          `Oreder for customer with id ${porcka.customerId} is rejected`
        );
      }
    }
    divNumberProducts.innerHTML = "";
  }
  displayResults() {
    const time = this.#arrayOfSuccesDel.reduce(
      (acc, order) => acc + order.time,
      0
    );
    const vremeRecharging = this.#arrayOfRejectedDeliveries.length * 20;
    const vremetoZaTovarene = (this.#arrayOfSuccesDel.length - 1) * 5; // 5 min za tovarene (-1 poslednata porcka kogato se vrne dronat v sklada)
    //console.log(vremetoZaTovarene);
    const totalTime = time + vremetoZaTovarene + vremeRecharging;
    if (totalTime > 720) {
      alert(
        "Number of drones are small to deliver all products in one day. Kmet trebe poveci pari da dade povece skladove ili dronove"
      );
    }
    const textHTML = `<div>Total time for delivery : ${totalTime}</div>`;
    divRezultatite.insertAdjacentHTML("afterbegin", textHTML);
  }
  addTownCord(e) {
    e.preventDefault();
    const xTop = +document.querySelector("#top-x").value;
    const yTop = +document.querySelector("#top-y").value;
    this.#dataAPP["map-top-right-coordinate"] = { x: xTop, y: yTop };
    document.querySelector("#top-x").value = "";
    document.querySelector("#top-y").value = "";
  }
  addProduct(e) {
    e.preventDefault();
    const proizvodat = document.querySelector("#ime_proizvoda").value;
    this.#dataAPP.products.push(proizvodat);
    const htmlTeksta = `<option value="${proizvodat}">${proizvodat}</option>`;
    document
      .querySelector("#products")
      .insertAdjacentHTML("beforeend", htmlTeksta);
    document.querySelector("#ime_proizvoda").value = "";
  }
  addCustomer(e) {
    e.preventDefault();
    const imetoNaCust = document.querySelector("#ime").value;
    const xKordinatata = +document.querySelector("#x_koordinata").value;
    const yKordinatata = +document.querySelector("#y_koordinata").value;
    const novCust = new Customer(
      this.id,
      imetoNaCust,
      xKordinatata,
      yKordinatata
    );
    this.id++;
    this.#dataAPP.customers.push(novCust);
    const tekstaZaHtml = `<option value="${imetoNaCust}">${imetoNaCust}</option>`;
    document
      .querySelector("#customer")
      .insertAdjacentHTML("beforeend", tekstaZaHtml);
    document.querySelector("#ime").value = "";
    document.querySelector("#x_koordinata").value = "";
    document.querySelector("#y_koordinata").value = "";
  }
  addWareHouse(e) {
    e.preventDefault();
    const imetoNaSklada = document.querySelector("#imeto_sklad").value;
    const xSklad = +document.querySelector("#x_sklad").value;
    const ySklad = +document.querySelector("#y_sklad").value;
    const skladObekt = new Warehouse(imetoNaSklada, xSklad, ySklad);
    this.#dataAPP.warehouses.push(skladObekt);
    const tekstzahtml = `<option value="${skladObekt.name}">${skladObekt.name}</option>`;
    document
      .querySelector("#warehouse")
      .insertAdjacentHTML("beforeend", tekstzahtml);
    const selectElement = document.getElementById("dron");
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedValue = selectedOption.value;
    switch (selectedValue) {
      case "dron1":
        skladObekt.dron = { capacity: 500, consumption: 1 };
        break;
      case "dron2":
        skladObekt.dron = { capacity: 1000, consumption: 3 };
        break;
      case "dron3":
        skladObekt.dron = { capacity: 2000, consumption: 5 };
        break;
    }
    //console.log(selectedValue);
    document.querySelector("#imeto_sklad").value = "";
    document.querySelector("#x_sklad").value = "";
    document.querySelector("#y_sklad").value = "";
  }
}
class Order {
  status;
  constructor(customerId, productList, warehouse, data) {
    this.data = data;
    this.customerId = customerId;
    this.productList = productList;
    this.warehouse = warehouse;
    this.distance = this.calculateDistance();
    this.time = this.calcTimeOneOrder(); //min
  }
  calculateDistance() {
    const { x: x1, y: y1 } = this.data.customers.filter(
      (cust) => cust.id === this.customerId
    )[0].coordinates;
    const { x: x2, y: y2 } = this.data.warehouses.filter(
      (sklad) => sklad.name === this.warehouse
    )[0];
    const rastojanieto = this.calcDistanceFunc(x1, x2, y1, y2);
    return rastojanieto;
  }
  calcDistanceFunc(x1, x2, y1, y2) {
    /* if (
      x1 > this.data["map-top-right-coordinate"].x ||
      x2 > this.data["map-top-right-coordinate"].x ||
      y1 > this.data["map-top-right-coordinate"].y ||
      y2 > this.data["map-top-right-coordinate"].y
    ) {
      alert("Wrong input");
      return;
    }*/
    const diffInX = x2 - x1;
    const diffInY = y2 - y1;
    const distance = +Math.sqrt(diffInX ** 2 + diffInY ** 2);
    return distance;
  }
  calcTimeOneOrder() {
    const vremetoZaEdinDelivery = +(2 * this.distance).toFixed(2); // Vremeto za edno delivery vremeto na drona od sklada do potrebitela i obratno, po uslovie na zadacata skorosta na drona e ednakva na rastojanieto. Po ispravno moze bi e da se s if provrei koj sklad e s po malko rastojanije od krajnata adresa na potrebitela no za tova njma dostatacno vreme :)
    return vremetoZaEdinDelivery;
  }
}
class Customer {
  constructor(id, name, xCord, yCord) {
    this.id = id;
    this.name = name;
    this.coordinates = { x: xCord, y: yCord };
  }
}
class Warehouse {
  dron;
  constructor(name, xKor, YKor) {
    this.name = name;
    this.x = xKor;
    this.y = YKor;
  }
}

const app = new App();
