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

  return [
    Math.round(totalRevenue).toLocaleString("id-ID"),
    jumlahTransaksi.toLocaleString("id-ID"),
    [jumlahCashLoc, jumlahCreditLoc],
    topProduct,
    revenueByLocation,
    tabelPerLokasi,
    [labels, quantities],
  ];
}

function initialDataProcessing(data) {
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

  return [
    totalRevenueOutput,
    jumlahTransaksiOuput,
    transactionTypeOutput,
    topProduct,
    revenueByLocation,
    [labels, quantities],
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
      // scrollX: true,
      scrollY: "50vh",
      paging: true,
      responsive: true,
    });

    //VARIABLE UNTUK MENAMPUNG DATA OLAHAN PERTAMA
    const initalData = initialDataProcessing(data);

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
    //locationRevenueChart.data.options.plugins.title.display
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
        responsive: true,
        maintainAspectRatio: true,
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
        responsive: true,
        maintainAspectRatio: true,
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
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y", // Horizontal bar chart
        plugins: {
          title: {
            display: true,
            text: "Total Product Sold by Month",
            font: {
              size: 20,
            },
            color: "black",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Product Sold",
            },
          },
          y: {
            title: {
              display: true,
              text: "Month",
            },
          },
        },
      },
    });

    //FIlTER DROPDOWN
    const filterDropdown = document.getElementById("location");
    console.log(filterDropdown);
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
        resetDashboard(reset, initalData);
      }
    });

    function updateDashboard(option, locationLabel) {
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

      //MENGUBAH DATATABLE BERDASARKAN DATA LOKASI
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
          // scrollX: true,
          scrollY: "50vh",
          paging: true,
          responsive: true,
        })
        .draw();

      locationRevenueChart.update();
      transactionTypeChart.update();
      productSalesPerMonth.update();
    }

    function resetDashboard(reset, initalData) {
      // MENAMPILKAN DATA TOTAL REVENUE KE WEB
      const revenuePrint = document.querySelector(".item3 .dataValue");
      revenuePrint.textContent = `$${reset[0]}`;

      // MENAMPILKAN DATA JUMLAH TRANSAKSI KE WEB
      const transactionPrint = document.querySelector(".item2 .dataValue");
      transactionPrint.textContent = `${reset[1]} `;

      // MENAMPILKAN DATA TOP PRODUCT KE WEB
      const topProductPrint = document.querySelector(".item4 .dataValue");
      topProductPrint.textContent = `${initalData[3]}`;

      // MENAMPILKAN DATA CHART REVENUE TIAP BULAN
      dataTType.datasets[0].data = reset[2];
      locationRevenueChart.data.datasets = [
        {
          label: "Brunswick Sq Mall",
          data: initalData[4]["Brunswick Sq Mall"],
        },
        { label: "Earle Asphalt", data: initalData[4]["Earle Asphalt"] },
        { label: "GuttenPlans", data: initalData[4]["GuttenPlans"] },
        {
          label: "EB Public Library",
          data: initalData[4]["EB Public Library"],
        },
      ];

      // MENAMPILKAN DATA PRODUCT SALES BULANAN PER LOKASI
      productSalesPerMonth.data.labels = initalData[5][0].map((month) =>
        new Date(0, month - 1).toLocaleString("en", { month: "long" })
      );
      productSalesPerMonth.data.datasets[0].data = initalData[5][1];

      //
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
          // scrollX: true,
          scrollY: "50vh",
          paging: true,
          responsive: true,
        })
        .draw();

      locationRevenueChart.update();
      transactionTypeChart.update();
      productSalesPerMonth.update();
    }
  } catch (error) {
    console.log("There has been a problem with your fetch operation:", error);
  }
}

fetchData();
