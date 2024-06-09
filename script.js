const teamMemberBtn = document.getElementById("teamMember");
const modals = document.querySelector(".modals");
const yesButton = document.querySelector(".modals-btn .submit");
const noButton = document.querySelector(".modals-btn .reset");
const screenOverlay = document.querySelector(".overlay");

teamMemberBtn.addEventListener("click", function () {
  modals.style.display = "flex";
  screenOverlay.style.display = "block";
  document.body.style.pointerEvents = "none";
  modals.style.pointerEvents = "auto";
});

noButton.addEventListener("click", function () {
  modals.style.display = "none";
  screenOverlay.style.display = "none";
  document.body.style.pointerEvents = "";
});

yesButton.addEventListener("click", function () {
  window.location.href = "./teamMemberPage/teamMember.html";
});

AOS.init({
  offset: 120,
  duration: 600,
  easing: "ease-in-out-sine",
  delay: 100,
});

//FUNSI UNTUK UPDATE WAKTU
function updateDateTime() {
  const now = new Date();
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
  };
  const formattedDate = now.toLocaleDateString("en-US", options);
  document.getElementById("date").textContent = formattedDate;
}
setInterval(updateDateTime, 60000); //UPDATE WAKTU PER 1 MENIT
updateDateTime(); //PANGGIL FUNGSI UPDATE WAKTU

function dataProcessingByLocation(data, loc) {
  //PRODUCT SALES
  let productSales = 0;
  let productSalesOutput = 0;
  data.forEach((e) => {
    if (e.Location == loc) {
      productSales += parseInt(e.RQty);
    }
  });

  productSalesOutput = productSales.toLocaleString("id-ID");

  //0. TOTAL REVENUE PER LOKASI
  let totalRevenue = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].Location == loc) {
      totalRevenue += parseFloat(data[i].Revenue);
    }
  }

  //1. TOTAL JUMLAH TRANSAKSI PER LOKASI
  let jumlahTransaksi = 0;
  for (i = 0; i < data.length; i++) {
    if (data[i].Location == loc) {
      jumlahTransaksi++;
    }
  }

  //2. TIPE TRANSAKSI PER LOKASI
  let jumlahCashLoc = 0;
  let jumlahCreditLoc = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].Type == "Cash" && data[i].Location == loc) {
      jumlahCashLoc++;
    } else if (data[i].Type === "Credit" && data[i].Location == loc) {
      jumlahCreditLoc++;
    }
  }

  //3. MENCARI TOP PRODUCT
  const revenueByProduct = {};
  // Aggregate revenue by product for the specified location
  data.forEach((entry) => {
    if (entry.Location === loc) {
      const product = entry.Product;
      const revenue = parseFloat(entry.Revenue);

      if (!revenueByProduct[product]) {
        revenueByProduct[product] = 0;
      }

      revenueByProduct[product] += revenue;
    }
  });

  let topProduct = null;
  let maxRevenue = 0;

  // Determine the top product for the specified location
  for (const product in revenueByProduct) {
    if (revenueByProduct[product] > maxRevenue) {
      maxRevenue = revenueByProduct[product];
      topProduct = product;
    }
  }

  //4. MENCARI REVENUE BULANAN PERLOKASI
  const revenueByLocation = {};
  // Initialize each location with an array of 12 months
  data.forEach((e) => {
    const location = e.Location;
    if (location === loc) {
      if (!revenueByLocation[location]) {
        revenueByLocation[location] = new Array(12).fill(0);
      }
    }
  });

  // Aggregate revenue by location and month
  data.forEach((e) => {
    const location = e.Location;
    if (location === loc) {
      const month = parseInt(e.Month) - 1; // Convert month to zero-based index
      const revenue = parseFloat(e.Revenue);
      revenueByLocation[location][month] += revenue;
    }
  });

  //5. MENYIMPAN DATA UNTUK TABEL PER LOKASI
  const tabelPerLokasi = data.filter((e) => e.Location == loc);

  //6. Mengelompokkan data berdasarkan Month dan menghitung total quantity
  const monthQuantityMap = new Map();
  data.forEach((item) => {
    if (item.Location === loc) {
      const month = new Date(item.TransDate).getMonth() + 1; // Extract month from TransDate
      const quantity = parseInt(item.RQty);

      if (monthQuantityMap.has(month)) {
        monthQuantityMap.set(month, monthQuantityMap.get(month) + quantity);
      } else {
        monthQuantityMap.set(month, quantity);
      }
    }
  });

  // Memisahkan hasil map menjadi dua array untuk chart
  const labels = Array.from(monthQuantityMap.keys()).sort((a, b) => a - b); // Sort by month
  const quantities = labels.map((month) => monthQuantityMap.get(month));

  //7. Proses data untuk mendapatkan total_revenue per location dan category
  const dataMap = new Map();

  data.forEach((item) => {
    const location = item.Location;
    const category = item.Category;
    const revenue = parseFloat(item.Revenue);

    // Filter untuk lokasi tertentu
    if (loc.includes(location)) {
      if (!dataMap.has(location)) {
        dataMap.set(location, new Map());
      }

      if (!dataMap.get(location).has(category)) {
        dataMap.get(location).set(category, 0);
      }

      const currentRevenue = dataMap.get(location).get(category);
      dataMap.get(location).set(category, currentRevenue + revenue);
    }
  });

  // Buat array untuk lokasi dan kategori
  const locations = Array.from(dataMap.keys());
  const categoriesRev = Array.from(new Set(data.map((item) => item.Category)));

  // Buat datasets untuk Chart.js
  const categoriesDatasets = categoriesRev.map((category, index) => {
    return {
      label: category,
      data: locations.map((location) => {
        return dataMap.get(location).get(category) || 0;
      }),
    };
  });

  //8.
  const categoryMap = {};
  data.forEach((item) => {
    const category = item.Category;
    const transactionCount = parseInt(item.RQty, 10); // Ensure base 10

    if (item.Location == loc) {
      if (categoryMap[category]) {
        categoryMap[category] += transactionCount;
      } else {
        categoryMap[category] = transactionCount;
      }
    }
  });

  const categoriyTC = Object.keys(categoryMap);
  const transactions = Object.values(categoryMap);

  //9. Extract product names, categories, and transaction counts
  const productMap = {};

  data.forEach((item) => {
    if (item.Location == loc) {
      const product = item.Product; // Penyesuaian nama properti menjadi "Product"
      const transactionCount = parseInt(item.RQty, 10); // Penyesuaian nama properti menjadi "Transaction" dan "TransactionCount"

      if (productMap[product]) {
        productMap[product].count += transactionCount;
        productMap[product].category = item.Category; // Penyesuaian nama properti menjadi "Category"
      } else {
        productMap[product] = {
          count: transactionCount,
          category: item.Category, // Penyesuaian nama properti menjadi "Category"
        };
      }
    }
  });

  // Sort products by transaction count in descending order and take top 10
  const sortedProducts = Object.keys(productMap)
    .sort((a, b) => productMap[b].count - productMap[a].count)
    .slice(0, 10);

  const products = sortedProducts;
  const prodTransactions = sortedProducts.map(
    (product) => productMap[product].count
  );
  const prodCategories = sortedProducts.map(
    (product) => productMap[product].category
  );

  return [
    Math.round(totalRevenue).toLocaleString("id-ID"),
    jumlahTransaksi.toLocaleString("id-ID"),
    [jumlahCashLoc, jumlahCreditLoc],
    topProduct,
    revenueByLocation,
    tabelPerLokasi,
    [labels, quantities],
    [locations, categoriesRev, categoriesDatasets],
    [categoriyTC, transactions],
    [products, prodTransactions, prodCategories],
    productSalesOutput,
  ];
}

function initialDataProcessing(data) {
  //PRODUCT SALES
  let productSales = 0;
  let productSalesOutput = 0;
  data.forEach((e) => {
    productSales += parseInt(e.RQty);
  });

  productSalesOutput = productSales.toLocaleString("id-ID");

  //0. TOTAL REVENUE KESELURUHAN
  let totalRevenue = 0;
  let totalRevenueOutput = 0;
  data.forEach((e) => {
    totalRevenue += parseFloat(e.Revenue);
  });
  totalRevenueOutput = Math.round(totalRevenue).toLocaleString("id-ID");

  //1. JUMLAH TRANSAKSI KESELURUHAN
  let jumlahTransaksi = data.length;
  let jumlahTransaksiOuput = jumlahTransaksi.toLocaleString("id-ID");

  //2. HITUNG TIPE TRANSAKSI
  let jumlahCash = 0;
  let jumlahCredit = 0;
  let transactionTypeOutput = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].Type === "Cash") {
      jumlahCash++;
    } else if (data[i].Type === "Credit") {
      jumlahCredit++;
    }
  }

  transactionTypeOutput = [jumlahCash, jumlahCredit];

  //3. MENCARI TOP PRODUCT
  const productRevenue = {};
  // Aggregate revenue by product
  data.forEach((entry) => {
    const product = entry.Product;
    const revenue = parseFloat(entry.Revenue);

    if (!productRevenue[product]) {
      productRevenue[product] = 0;
    }

    productRevenue[product] += revenue;
  });

  // Find the product with the highest revenue
  let topProduct = null;
  let maxRevenue = 0;

  for (const product in productRevenue) {
    if (productRevenue[product] > maxRevenue) {
      maxRevenue = productRevenue[product];
      topProduct = product;
    }
  }

  //4. MENCARI REVENUE BULANAN TIAP LOKASI
  let revenueByLocation = [];
  // Initialize each location with an array of 12 months
  data.forEach((e) => {
    const location = e.Location;

    if (!revenueByLocation[location]) {
      revenueByLocation[location] = new Array(12).fill(0);
    }
  });

  // Aggregate revenue by location and month
  data.forEach((e) => {
    const location = e.Location;
    const month = parseInt(e.Month) - 1; // Convert month to zero-based index
    const revenue = parseFloat(e.Revenue);

    revenueByLocation[location][month] += revenue;
  });

  //5. Mengelompokkan data berdasarkan Month dan menghitung total quantity
  const monthQuantityMap = new Map();
  data.forEach((item) => {
    const month = new Date(item.TransDate).getMonth() + 1; // Extract month from TransDate
    const quantity = parseInt(item.RQty);
    if (monthQuantityMap.has(month)) {
      monthQuantityMap.set(month, monthQuantityMap.get(month) + quantity);
    } else {
      monthQuantityMap.set(month, quantity);
    }
  });

  // Memisahkan hasil map menjadi dua array untuk chart
  const labels = Array.from(monthQuantityMap.keys()).sort((a, b) => a - b); // Sort by month
  const quantities = labels.map((month) => monthQuantityMap.get(month));

  //6. mendapatkan total_revenue per location dan category
  const dataMap = new Map();

  data.forEach((item) => {
    const location = item.Location;
    const category = item.Category;
    const revenue = parseFloat(item.Revenue);

    if (!dataMap.has(location)) {
      dataMap.set(location, new Map());
    }

    if (!dataMap.get(location).has(category)) {
      dataMap.get(location).set(category, 0);
    }

    const currentRevenue = dataMap.get(location).get(category);
    dataMap.get(location).set(category, currentRevenue + revenue);
  });

  // Buat array untuk lokasi dan kategori
  const locations = Array.from(dataMap.keys());
  const categoriesRev = Array.from(new Set(data.map((item) => item.Category)));

  // Buat datasets untuk Chart.js
  const categoriesDatasets = categoriesRev.map((category, index) => {
    return {
      label: category,
      data: locations.map((location) => {
        return dataMap.get(location).get(category) || 0;
      }),
    };
  });

  //7. Extract category names and transaction counts
  const categoryMap = {};

  data.forEach((item) => {
    const category = item.Category;
    const transactionCount = parseInt(item.RQty, 10); // Ensure base 10

    if (categoryMap[category]) {
      categoryMap[category] += transactionCount;
    } else {
      categoryMap[category] = transactionCount;
    }
  });

  const categoriyTC = Object.keys(categoryMap);
  const transactions = Object.values(categoryMap);

  //8. Extract product names, categories, and transaction counts
  const productMap = {};

  data.forEach((item) => {
    const product = item.Product; // Penyesuaian nama properti menjadi "Product"
    const transactionCount = parseInt(item.RQty, 10); // Penyesuaian nama properti menjadi "Transaction" dan "TransactionCount"

    if (productMap[product]) {
      productMap[product].count += transactionCount;
      productMap[product].category = item.Category; // Penyesuaian nama properti menjadi "Category"
    } else {
      productMap[product] = {
        count: transactionCount,
        category: item.Category, // Penyesuaian nama properti menjadi "Category"
      };
    }
  });

  // Sort products by transaction count in descending order and take top 10
  const sortedProducts = Object.keys(productMap)
    .sort((a, b) => productMap[b].count - productMap[a].count)
    .slice(0, 10);

  const products = sortedProducts;
  const prodTransactions = sortedProducts.map(
    (product) => productMap[product].count
  );
  const prodCategories = sortedProducts.map(
    (product) => productMap[product].category
  );

  return [
    totalRevenueOutput,
    jumlahTransaksiOuput,
    transactionTypeOutput,
    topProduct,
    revenueByLocation,
    [labels, quantities],
    [locations, categoriesRev, categoriesDatasets],
    [categoriyTC, transactions, categoryMap],
    [products, prodTransactions, prodCategories],
    productSalesOutput,
  ];
}

//API CALL
const localApiURL = "assets/json/rawData.json";
async function fetchData() {
  try {
    const response = await fetch(localApiURL);
    if (!response.ok) {
      throw new Error("response was not ok" + response.statusText);
    }
    const data = await response.json();
    //VARIABLE UNTUK MENAMPUNG DATA OLAHAN PERTAMA
    const initalData = initialDataProcessing(data);

    //MENAMPILKAN DATA PRODUCT SALES
    const productSalesPrint = document.querySelector(".item1 .dataValue");
    productSalesPrint.textContent = initalData[9];

    //MENAMPILKAN DATA JUMLAH TRANSAKSI KE WEB
    const transactionPrint = document.querySelector(".item2 .dataValue");
    transactionPrint.textContent = `${initalData[1]} `;

    //MENAMPILKAN DATA TOTAL REVENUE KE WEB
    const revenuePrint = document.querySelector(".item3 .dataValue");
    revenuePrint.textContent = `$${initalData[0]}`;

    //MENAMPILKAN DATA TOP PRODUCT KE WEB
    const topProductPrint = document.querySelector(".item4 .dataValue");
    topProductPrint.textContent = `${initalData[3]}`;

    //PANGGIL FUNCTION UNTUK MEMBUAT DAN MENAMPILKAN CHART REVENUE
    const canvasRevenue = document
      .getElementById("revenueChart")
      .getContext("2d");
    const locationRevenueChart = new Chart(canvasRevenue, {
      type: "line",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ],
        datasets: [
          {
            label: "Brunswick Sq Mall",
            data: initalData[4]["Brunswick Sq Mall"],
          },
          { label: "Earle Asphalt", data: initalData[4]["Earle Asphalt"] },
          { label: "GuttenPlans", data: initalData[4]["GuttenPlans"] },
          {
            label: "EbPublicLibrary",
            data: initalData[4]["EB Public Library"],
          },
        ],
        fill: false,
      },
      options: {
        layout: {
          padding: {
            top: 16,
            bottom: 16,
            left: 8,
            right: 24,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Total Revenue by Month",
            font: {
              size: 20,
              family: "Inter",
              weight: "bold",
            },
            color: "black",
          },
        },
      },
    });

    //PANGGIL FUNGSI UNTUK MEMBUAT DAN MENAMPILKAN CHART TRANSACTION TYPE
    const canvasTType = document.getElementById("transactionTypeChart");
    const dataTType = {
      labels: ["Cash", "Credit"],
      datasets: [
        {
          data: initalData[2],
          hoverOffset: 4,
        },
      ],
    };
    const transactionTypeChart = new Chart(canvasTType, {
      type: "pie",
      data: dataTType,
      options: {
        layout: {
          padding: {
            top: 16,
            bottom: 16,
            left: 8,
            right: 8,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Transaction Type",
            font: {
              size: 20,
              family: "Inter",
              weight: "bold",
            },
            color: "black",
          },
        },
      },
    });

    //MEMBUAT DAN MENAMPILKAN CHART TOTAL PRODUCT SOLD BY MONTH
    const ctxBar = document
      .getElementById("horizontalBarChart")
      .getContext("2d");
    const productSalesPerMonth = new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: initalData[5][0].map((month) =>
          new Date(0, month - 1).toLocaleString("en", { month: "long" })
        ),
        datasets: [
          {
            label: "Total Product",
            data: initalData[5][1],
            borderWidth: 1,
          },
        ],
      },
      options: {
        layout: {
          padding: {
            top: 16,
            bottom: 16,
            left: 8,
            right: 24,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          title: {
            display: true,
            text: "Total Product Sold by Month",
            font: {
              size: 20,
            },
            color: "black",
          },
          legend: {
            display: false,
          },
        },
      },
    });

    // MEMBUAT CHART REVENUE CATEGORY
    const ctx = document.getElementById("revenueBarChart").getContext("2d");
    const categoriesRevenueChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: initalData[6][0],
        datasets: initalData[6][2],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Total Revenue by Category",
            font: {
              size: 20,
            },
            color: "black",
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });

    // Create the doughnut chart
    const donutCtx = document
      .getElementById("myDoughnutChart")
      .getContext("2d");
    const categoryDonut = new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: initalData[7][0],
        datasets: [
          {
            label: "Transactions",
            data: initalData[7][1],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 16,
            bottom: 24,
            left: 16,
            right: 16,
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Best-selling Category",
            font: {
              size: 19,
              family: "Arial",
              weight: "bold",
            },
            color: "black",
          },
        },
      },
    });

    // Create the top 10 product bar chart
    const topProdctx = document.getElementById("myBarChart").getContext("2d");
    const top10ProductChart = new Chart(topProdctx, {
      type: "bar",
      data: {
        labels: initalData[8][0],
        datasets: [
          {
            data: initalData[8][1],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 16,
            bottom: 24,
            left: 24,
            right: 24,
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Top 10 Products with the Largest Transactions",
            align: "center",
            font: {
              size: 19,
              family: "Arial",
              weight: "bold",
            },
            color: "black",
          },
          legend: {
            display: false, // Hide legend
          },
          tooltip: {
            callbacks: {
              afterLabel: function (context) {
                return `Category: ${initalData[8][2][context.dataIndex]}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    //DATATABLE
    const myTable = new DataTable("#myTable");
    $("#myTable").DataTable({
      data: data,
      columns: [
        { data: "Transaction" },
        { data: "Location" },
        { data: "Product" },
        { data: "Category" },
        { data: "TransDate" },
        { data: "RPrice" },
        { data: "RQty" },
        { data: "Revenue" },
      ],
      bDestroy: true,
      scrollX: true,
      scrollY: "50vh",
      paging: true,
      responsive: true,
      maintainAspectRatio: false,
    });

    //FIlTER DROPDOWN
    const filterDropdown = document.getElementById("location");
    filterDropdown.addEventListener("change", function () {
      const locations = {
        Opt1: "Brunswick Sq Mall",
        Opt2: "Earle Asphalt",
        Opt3: "GuttenPlans",
        Opt4: "EB Public Library",
      };

      const selectedLocation = locations[filterDropdown.value];
      if (selectedLocation) {
        const option = dataProcessingByLocation(data, selectedLocation);
        console.log(option);
        updateDashboard(option, selectedLocation);
      } else {
        const reset = initialDataProcessing(data);
        console.log(reset);
        resetDashboard(reset);
      }
    });

    function updateDashboard(option, locationLabel) {
      const locationName = locationLabel;

      //MENAMPILKAN LOKASI DI TEKS DESKRIPSI
      const desc = document.querySelectorAll(".shortDesc");
      for (i = 0; i < desc.length; i++) {
        desc[i].textContent = `at ${locationName}`;
      }

      //MENAMPILKAN DATA PRODUCT SALES
      const productSalesPrint = document.querySelector(".item1 .dataValue");
      productSalesPrint.textContent = option[10];

      // MENAMPILKAN DATA TOTAL REVENUE KE WEB
      const revenuePrint = document.querySelector(".item3 .dataValue");
      revenuePrint.textContent = `$${option[0]}`;

      // MENAMPILKAN DATA JUMLAH TRANSAKSI KE WEB
      const transactionPrint = document.querySelector(".item2 .dataValue");
      transactionPrint.textContent = `${option[1]} `;

      // MENAMPILKAN DATA TOP PRODUCT KE WEB
      const topProductPrint = document.querySelector(".item4 .dataValue");
      topProductPrint.textContent = `${option[3]}`;

      // MENAMPILKAN DATA CHART REVENUE TIAP BULAN
      dataTType.datasets[0].data = option[2];
      locationRevenueChart.data.datasets = [
        { label: locationLabel, data: option[4][locationLabel] },
      ];

      // MENAMPILKAN DATA PRODUCT SALES BULANAN PER LOKASI
      productSalesPerMonth.data.labels = option[6][0].map((month) =>
        new Date(0, month - 1).toLocaleString("en", { month: "long" })
      );
      productSalesPerMonth.data.datasets[0].data = option[6][1];

      //MENAMPILKAN DATA REVENUE CATEGORI PER LOKASI
      categoriesRevenueChart.data.labels = option[7][0];
      categoriesRevenueChart.data.datasets = option[7][2];

      //MENAMPILKAN DATA TRANSAKSI CATEGORI PER LOKASI
      categoryDonut.data.labels = option[8][0];
      categoryDonut.data.datasets[0].data = option[8][1];

      //MENAMPILKAN DATA TOP 10 PORDUCT PER LOKASI
      top10ProductChart.data.labels = option[9][0];
      top10ProductChart.data.datasets[0].data = option[9][1];

      //RESET DAN MENGUBAH DATATABLE BERDASARKAN DATA LOKASI
      myTable.clear().draw();
      $("#myTable")
        .DataTable({
          data: option[5],
          columns: [
            { data: "Transaction" },
            { data: "Location" },
            { data: "Product" },
            { data: "Category" },
            { data: "TransDate" },
            { data: "RPrice" },
            { data: "RQty" },
            { data: "Revenue" },
          ],
          bDestroy: true,
          scrollX: true,
          scrollY: "50vh",
          paging: true,
          responsive: true,
        })
        .draw();

      locationRevenueChart.update();
      transactionTypeChart.update();
      productSalesPerMonth.update();
      categoriesRevenueChart.update();
      categoryDonut.update();
      top10ProductChart.update();
    }

    function resetDashboard(reset) {
      //MENAMPILKAN LOKASI DI TEKS DESKRIPSI
      const desc = document.querySelectorAll(".shortDesc");
      for (i = 0; i < desc.length; i++) {
        desc[i].textContent = `at All Location`;
      }

      //MENAMPILKAN DATA PRODUCT SALES
      const productSalesPrint = document.querySelector(".item1 .dataValue");
      productSalesPrint.textContent = reset[9];

      // MENAMPILKAN DATA TOTAL REVENUE KE WEB
      const revenuePrint = document.querySelector(".item3 .dataValue");
      revenuePrint.textContent = `$${reset[0]}`;

      // MENAMPILKAN DATA JUMLAH TRANSAKSI KE WEB
      const transactionPrint = document.querySelector(".item2 .dataValue");
      transactionPrint.textContent = `${reset[1]} `;

      // MENAMPILKAN DATA TOP PRODUCT KE WEB
      const topProductPrint = document.querySelector(".item4 .dataValue");
      topProductPrint.textContent = `${reset[3]}`;

      // MENAMPILKAN DATA CHART REVENUE TIAP BULAN
      dataTType.datasets[0].data = reset[2];
      locationRevenueChart.data.datasets = [
        {
          label: "Brunswick Sq Mall",
          data: reset[4]["Brunswick Sq Mall"],
        },
        { label: "Earle Asphalt", data: reset[4]["Earle Asphalt"] },
        { label: "GuttenPlans", data: reset[4]["GuttenPlans"] },
        {
          label: "EB Public Library",
          data: reset[4]["EB Public Library"],
        },
      ];

      // MENAMPILKAN DATA PRODUCT SALES BULANAN
      productSalesPerMonth.data.labels = reset[5][0].map((month) =>
        new Date(0, month - 1).toLocaleString("en", { month: "long" })
      );
      productSalesPerMonth.data.datasets[0].data = reset[5][1];

      //MENAMPILKAN DATA REVENUE CATEGORI
      categoriesRevenueChart.data.labels = reset[6][0];
      categoriesRevenueChart.data.datasets = reset[6][2];

      //MENAMPILKAN DATA TRANSAKSI CATEGORI
      categoryDonut.data.labels = reset[7][0];
      categoryDonut.data.datasets[0].data = reset[7][1];

      //MENAMPILKAN DATA TOP 10 PORDUCT
      top10ProductChart.data.labels = reset[8][0];
      top10ProductChart.data.datasets[0].data = reset[8][1];

      //RESET DATATABLE KE KONDISI AWAL
      myTable.clear().draw();
      $("#myTable")
        .DataTable({
          data: data,
          columns: [
            { data: "Transaction" },
            { data: "Location" },
            { data: "Product" },
            { data: "Category" },
            { data: "TransDate" },
            { data: "RPrice" },
            { data: "RQty" },
            { data: "Revenue" },
          ],
          bDestroy: true,
          scrollX: true,
          scrollY: "50vh",
          paging: true,
          responsive: true,
        })
        .draw();

      locationRevenueChart.update();
      transactionTypeChart.update();
      productSalesPerMonth.update();
      categoriesRevenueChart.update();
      categoryDonut.update();
      top10ProductChart.update();
    }
  } catch (error) {
    console.log("There has been a problem with your fetch operation:", error);
  }
}

fetchData();
