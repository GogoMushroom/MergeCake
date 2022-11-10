import * as Api from "../api.js";

const $email = document.querySelector("#email");
const $name = document.querySelector(".name");
const $phoneNumber = document.querySelector(".phone-number");
// const $postcode = document.querySelector(".postcode");
// const $address = document.querySelector(".address");
// const $detailAddress = document.querySelector(".detailAddress");
// const $extraAddress = document.querySelector(".extraAddress");
const $moreInformationForm = document.querySelector("#more-information-form");

const $postcodInput = document.querySelector("#postcode");
const $addressInput = document.querySelector("#address");
const $detailAddressInput = document.querySelector("#detailAddress");
const $extraAddressInput = document.querySelector("#extraAddress");

const $searchAddressButton = document.querySelector("#searchAddressButton");

// DB 가져오기
const email = sessionStorage.getItem("email");

const getUsers = async (email) => {
  const userList = await Api.get("/api/userlist");
  return userList.find((user) => user.EMAIL === email);
};

const userInfo = await getUsers(email);
const setUserInfo = (targetUserInfo) => {
  // console.log(userInfo._id);
  // 이름 없으면 회원님....

  const name = targetUserInfo.FULL_NAME ?? "";
  const phoneNumber = targetUserInfo.PHONE_NUMBER ?? "";
  const postcode = targetUserInfo.ZIP_CODE ?? "";
  const address = targetUserInfo.ADDRESS1 ?? "";
  const detailAddress = targetUserInfo.ADDRESS2 ?? "";
  const extraAddress = targetUserInfo.ADDRESS1_REF ?? "";

  $email.innerText = email;
  $name.innerText = name;
  $phoneNumber.innerText = phoneNumber;

  $postcodInput.value = postcode;
  $addressInput.value = address;
  $detailAddressInput.value = detailAddress;
  $extraAddressInput.value = extraAddress;
};
setUserInfo(userInfo);

$moreInformationForm.addEventListener("click", function (e) {
  // 추가정보 - 수정하기
  if (e.target.classList.contains("edit-btn")) {
    const targetEl = e.target;
    const inputEl = targetEl.parentElement.querySelector("input");
    inputEl.style.display = "block";
    const labelEl = targetEl.parentElement.querySelector("label");
    labelEl.style.display = "none";
    inputEl.value = labelEl.innerText;
    const containerEl =
      targetEl.parentElement.parentElement.querySelector(".button-container");
    containerEl.style.display = "block";
    targetEl.style.display = "none";
  }

  // 추가정보 - 취소
  if (e.target.classList.contains("cancel-button")) {
    const targetEl = e.target;
    const inputEl = targetEl.parentElement.parentElement.querySelector(
      ".input-field > input"
    );
    inputEl.style.display = "none";
    const labelEl = targetEl.parentElement.parentElement.querySelector(
      ".input-field > label"
    );
    labelEl.style.display = "block";
    const containerEl = targetEl.parentElement;
    containerEl.style.display = "none";
    const editBtnEl = targetEl.parentElement.parentElement.querySelector(
      ".input-field > .edit-btn"
    );
    editBtnEl.style.display = "block";
  }
});

// 주소 수정하기
// 우편번호 찾기
$searchAddressButton.addEventListener("click", () => {
  console.log("clc");
  new daum.Postcode({
    oncomplete: function (data) {
      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

      // 각 주소의 노출 규칙에 따라 주소를 조합한다.
      // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
      let addr = ""; // 주소 변수
      let extraAddr = ""; // 참고항목 변수

      // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
      if (data.userSelectedType === "R") {
        // 사용자가 도로명 주소를 선택했을 경우
        addr = data.roadAddress;
      } else {
        // 사용자가 지번 주소를 선택했을 경우(J)
        addr = data.jibunAddress;
      }

      // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
      if (data.userSelectedType === "R") {
        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        // 건물명이 있고, 공동주택일 경우 추가한다.
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
        // 조합된 참고항목을 해당 필드에 넣는다.
        document.getElementById("extraAddress").value = extraAddr;
      } else {
        document.getElementById("extraAddress").value = "";
      }

      // 우편번호와 주소 정보를 해당 필드에 넣는다.
      document.getElementById("postcode").value = data.zonecode;
      document.getElementById("address").value = addr;
      // 커서를 상세주소 필드로 이동한다.
      document.getElementById("detailAddress").value = "";
      document.getElementById("detailAddress").focus();
    },
  }).open();
});

// // 취소 버튼 클릭
// $cancelButton.addEventListener("click", (e) => {
//   e.preventDefault();

//   console.log("cancel");
//   window.location.href = "/cart";
// });

// // 확인 버튼 클릭
// $submitButton.addEventListener("click", async (e) => {
//   e.preventDefault();

//   const fullName = $fullNameInput.value;
//   const phoneNumber = $phoneNumberInput.value;
//   const postcode = $postcode.value;
//   const address = $address.value;
//   const detailAddress = $detailAddress.value;
//   const extraAddress = $extraAddress.value;
//   const isChecked = $checkbox.checked; // true일 경우 user 정보 수정

//   // 잘 입력했는지 확인
//   if (!fullName) {
//     return alert("이름이 입력되지 않았습니다.");
//   }
//   if (!validatePhoneNumber(phoneNumber)) {
//     return alert("휴대전화 번호 형식이 맞지 않습니다.");
//   }
//   if (!address) {
//     return alert("주소가 입력되지 않았습니다.");
//   }
//   if (!detailAddress) {
//     return alert("상세주소가 입력되지 않았습니다.");
//   }

//   // 🚨 장바구니 정보 DB 저장
//   /**
//    * 지훈님 코드
//    */

//   // isChecked = true 일 경우
//   // user 배송지 정보 DB 저장, 페이지 이동
//   if (isChecked) {
//     try {
//       // DB 가져오기
//       const email = sessionStorage.getItem("email");

//       const getUsers = async (email) => {
//         const userList = await Api.get("/api/userlist");
//         return userList.find((user) => user.EMAIL === email);
//       };

//       const userInfo = await getUsers(email);
//       const targetUserId = userInfo._id;

//       const data = {
//         FULL_NAME: fullName,
//         PHONE_NUMBER: phoneNumber,
//         ZIP_CODE: postcode,
//         ADDRESS1: address,
//         ADDRESS2: detailAddress,
//         ADDRESS1_REF: extraAddress.trim(),
//       };

//       await Api.patch(`/api/users/${targetUserId}`, data);

//       alert(`주문이 완료되었습니다.`);

//       // 🚨 마이페이지 이동
//       // 페이지 이름 맞춰서 경로 수정하기
//       window.location.href = "/mypage";
//     } catch (err) {
//       console.error(err.stack);
//       alert(
//         `문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`
//       );
//     }
//   }
//   // isChecked = true 일 경우, 페이지만 이동
//   else {
//     window.location.href = "/mypage";
//   }
// });

$moreInformationForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const targetUserId = userInfo._id;

  const data = {
    FULL_NAME:
      e.target.FULL_NAME.value.trim() === ""
        ? null
        : e.target.FULL_NAME.value.trim(),
    PHONE_NUMBER:
      e.target.PHONE_NUMBER.value.trim() === ""
        ? null
        : e.target.PHONE_NUMBER.value.trim(),
    // ZIP_CODE:
    //   e.target.ZIP_CODE.value.trim() === ""
    //     ? null
    //     : e.target.ZIP_CODE.value.trim(),
    // ADDRESS1:
    //   e.target.ADDRESS1.value.trim() === ""
    //     ? null
    //     : e.target.ADDRESS1.value.trim(),
    // ADDRESS2:
    //   e.target.ADDRESS2.value.trim() === ""
    //     ? null
    //     : e.target.ADDRESS2.value.trim(),
    // ADDRESS1_REF:
    //   e.target.ADDRESS1_REF.value.trim() === ""
    //     ? null
    //     : e.target.ADDRESS1_REF.value.trim(),
  };

  try {
    const result = await Api.patch(`/api/users/${targetUserId}`, data);
    e.target.parentElement.querySelector(".cancel-button").click();
    setUserInfo(result);
  } catch (err) {
    console.error(err);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
});
