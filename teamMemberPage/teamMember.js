AOS.init({
  offset: 120,
  duration: 600,
  easing: "ease-in-out-sine",
  delay: 100,
});

function generateCard(data) {
  //MEMBUAT ELEMEN CARD
  const card = document.createElement("div");
  card.className = "card";

  //MEMBUAT ELEMEN CARD HEAD
  const cardHead = document.createElement("div");
  cardHead.className = "cardHead";

  //MEMBUAT ELEMEN IMAGE
  const img = document.createElement("img");
  img.setAttribute("src", data.Foto);
  // img.setAttribute("src", data.img);
  // img.setAttribute("alt", data.alt);

  //APPEND ELEMEN IMAGE KE ELEMEN CARD HEAD
  cardHead.appendChild(img);

  //MEMBUAT ELEMEN CARD BODY
  const cardBody = document.createElement("div");
  cardBody.className = "cardBody";

  //MEMBUAT ELEMEN CARD TITLE
  const cardTitle = document.createElement("div");
  cardTitle.className = "cardTitle";

  //MEMBUAT ELEMEN NAMA
  const memberName = document.createElement("h3");
  memberName.className = "name";
  memberName.textContent = `${data.Nama}  `;

  //MEMBUAT ELEMEN ROLE
  const memberRole = document.createElement("h3");
  memberRole.className = "role";
  memberRole.textContent = data.Role;

  //APPEND ELEMEN NAMA DAN ROLE KE ELEMEN CARD TITLE
  cardTitle.appendChild(memberName);
  cardTitle.appendChild(memberRole);

  //MEMBUAT ELEMEN CARD DESCRIPTION
  const cardDesc = document.createElement("div");
  cardDesc.className = "cardDescription";

  //MEMBUAT ELEMEN DESCRIPTION
  const memberDesc = document.createElement("p");
  memberDesc.className = "description";
  memberDesc.textContent = data.desc;

  //APPEND ELEMEN DESCRIPTION KE CARD DESCRIPTION
  cardDesc.appendChild(memberDesc);

  //MEMBUAT ELEMEN LINK SOCMED
  const socMed = document.createElement("div");
  socMed.className = "socMed";

  //MEMBUAT LINK INSTAGRAM
  const instagram = document.createElement("a");
  instagram.className = "Instagram";
  instagram.setAttribute("href", data.Instagram);
  instagram.setAttribute("target", "blank");
  instagram.textContent = "Instagram";

  //MEMBUAT LINK LINKEDIN
  const linkedIn = document.createElement("a");
  linkedIn.className = "linkedIn";
  linkedIn.setAttribute("href", data.linkedin);
  linkedIn.setAttribute("target", "blank");
  linkedIn.textContent = "linkedIn";

  //APPEND LINK INSTAGRAM DAN LINKEDIN KE SOCMED
  socMed.appendChild(instagram);
  socMed.appendChild(linkedIn);

  //APPEND ELEMEN CARD TITLE DESC DAN SOCMED KE CARD BODY
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardDesc);
  cardBody.appendChild(socMed);

  //APPEND ELEMEN CARDHEAD DAN CARDBODY KE ELEMEN CARD
  card.appendChild(cardHead);
  card.appendChild(cardBody);

  return card;
}

//API CALL
const localApiURL = "./teamMember.json";
async function fetchData() {
  try {
    const response = await fetch(localApiURL);
    if (!response.ok) {
      throw new Error("response was not ok" + response.statusText);
    }
    const data = await response.json();
    console.log(data);

    const container = document.getElementsByClassName("container")[0];
    data.forEach((e) => {
      const cardElement = generateCard(e);
      container.appendChild(cardElement);
    });
  } catch (error) {
    console.log("There has been a problem with your fetch operation:", error);
  }
}

//fetchData();
