//TOGGLE SIDEBAR BUTTON
const sidebarBtn = document.getElementById("sidebarBtn");
sidebarBtn.addEventListener("click", function () {
  if (window.matchMedia("(max-width: 600px)").matches) {
    const sideBar = document.querySelector(".sideBar ul");
    sideBar.classList.toggle("sideBarClose");
  } else {
    const logo = document.querySelector(".top-sideBar h2");
    const sideBar = document.querySelectorAll(".sidebar-menu li h5");
    logo.classList.toggle("sideBarClose");
    for (let i = 0; i < sideBar.length; i++) {
      sideBar[i].classList.toggle("sideBarClose");
    }
  }
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

//DATA UNTUK TOTAL REVENUE
function sumOfRevenue(data) {
  let totalRevenue = 0;
  data.forEach((e) => {
    totalRevenue += parseInt(e.total_revenue);
  });

  return totalRevenue;
}

//DATA UNTUK JUMLAH TRANSAKSI
function countOfTranaction(data) {
  let jumlahTransaksi = 0;
  data.forEach((e) => {
    jumlahTransaksi += parseInt(e.jumlah_transaksi);
  });

  return jumlahTransaksi;
}

function calculateMonthlyRevenueByLocation(data) {
  const revenueByLocation = {};
  data.forEach((item) => {
    const location = item.Location;
    const month = item.Month;
    const revenue = parseFloat(item.total_revenue);

    if (!revenueByLocation[location]) {
      revenueByLocation[location] = {};
    }

    if (!revenueByLocation[location][month]) {
      revenueByLocation[location][month] = 0;
    }

    revenueByLocation[location][month] += revenue;
  });

  return revenueByLocation;
}

//API CALL
const localApiURL = "assets/json/data.json";
async function fetchData() {
  try {
    const response = await fetch(localApiURL);
    if (!response.ok) {
      throw new Error("response was not ok" + response.statusText);
    }
    //VARIABLE UNTUK MENERIMA RESPONS DATA JSON
    const data = await response.json();

    //VARIABEL UNTUK MENAMPUNG DATA TRANSAKSI
    const transactionValue = countOfTranaction(data);
    //MENAMPILKAN DATA JUMLAH TRANSAKSI KE WEB
    const transactionPrint = document.querySelector(".item2 .dataValue");
    transactionPrint.textContent = `${transactionValue} order`;

    //VARIABEL UNTUK MENAMPUNG DATA REVENUE
    const revenueValue = sumOfRevenue(data);
    //MENAMPILKAN DATA TOTAL REVENUE KE WEB
    const revenuePrint = document.querySelector(".item3 .dataValue");
    revenuePrint.textContent = `$${revenueValue}`;

    ////VARIABEL UNTUK MENAMPUNG DATA REVENUE TIAP LOKASI PERBULAN
    const monthlyRevenueByLocation = calculateMonthlyRevenueByLocation(data);
    console.log(monthlyRevenueByLocation);
  } catch (error) {
    console.log("There has been a problem with your fetch operation:", error);
  }
}

fetchData();
