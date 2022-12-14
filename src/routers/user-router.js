import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { userService } from "../services";
import { transPort } from "../config/email";

const userRouter = Router();

// 회원가입 api (아래는 /register이지만, 실제로는 /api/register로 요청해야 함.)
userRouter.post("/register", async (req, res, next) => {
  try {
    // Content-Type: application/json 설정을 안 한 경우, 에러를 만들도록 함.
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    // if (is.emptyObject(req.body)) {
    //   throw new Error(
    //     "headers의 Content-Type을 application/json으로 설정해주세요"
    //   );
    // }

    // req (request)의 body 에서 데이터 가져오기
    const { FULL_NAME, EMAIL, PASSWORD } = req.body;
    // 위 데이터를 유저 db에 추가하기
    const newUser = await userService.addUser({
      FULL_NAME,
      EMAIL,
      PASSWORD,
    });

    // 추가된 유저의 db 데이터를 프론트에 다시 보내줌
    // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// 로그인 api (아래는 /login 이지만, 실제로는 /api/login로 요청해야 함.)
userRouter.post("/login", async function (req, res, next) {
  try {
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    // if (is.emptyObject(req.body)) {
    //   throw new Error(
    //     "headers의 Content-Type을 application/json으로 설정해주세요"
    //   );
    // }

    // req (request) 에서 데이터 가져오기
    const { EMAIL, PASSWORD } = req.body;
    console.log(EMAIL, PASSWORD);

    // 로그인 진행 (로그인 성공 시 jwt 토큰을 프론트에 보내 줌)
    const userToken = await userService.getUserToken({ EMAIL, PASSWORD });

    // jwt 토큰을 프론트에 보냄 (jwt 토큰은, 문자열임)
    res.status(200).json(userToken);
  } catch (error) {
    next(error);
  }
});

// 전체 유저 목록을 가져옴 (배열 형태임)
// 미들웨어로 loginRequired 를 썼음 (이로써, jwt 토큰이 없으면 사용 불가한 라우팅이 됨)
//jwt 구현하고 loginRequired 넣어주기

userRouter.get(
  "/userlist",
  /* loginRequired, */ async function (req, res, next) {
    try {
      // 전체 사용자 목록을 얻음
      const users = await userService.getUsers();

      // 사용자 목록(배열)을 JSON 형태로 프론트에 보냄
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
);

// 사용자 정보 수정
// (예를 들어 /api/users/abc12345 로 요청하면 req.params.userId는 'abc12345' 문자열로 됨)
//jwt 구현하고 loginRequired 넣어주기
userRouter.patch(
  "/users/:userId",
  // loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.params.userId;

      const {
        FULL_NAME,
        PASSWORD,
        ZIP_CODE,
        ADDRESS1,
        ADDRESS1_REF,
        ADDRESS2,
        PHONE_NUMBER,
        ROLE,
      } = req.body;

      const userInfoRequired = { userId };

      const toUpdate = {
        ...(FULL_NAME && { FULL_NAME }),
        ...(PASSWORD && { PASSWORD }),
        ...(ZIP_CODE && { ZIP_CODE }),
        ...(ADDRESS1 && { ADDRESS1 }),
        ...(ADDRESS1_REF && { ADDRESS1_REF }),
        ...(ADDRESS2 && { ADDRESS2 }),
        ...(PHONE_NUMBER && { PHONE_NUMBER }),
        ...(ROLE && { ROLE }),
      };

      const updatedUserInfo = await userService.setUser(
        userInfoRequired,
        toUpdate
      );

      res.status(200).json(updatedUserInfo);
    } catch (error) {
      next(error);
    }
  }
);

//유저를 가져옴
// 미들웨어로 loginRequired 를 썼음 (이로써, jwt 토큰이 없으면 사용 불가한 라우팅이 됨)
userRouter.get(
  "/user/:userId",
  /* loginRequired, */ async function (req, res, next) {
    const { userId } = req.params;
    console.log(userId);
    try {
      // 전체 사용자 목록을 얻음
      const users = await userService.getUser(userId);

      // 사용자 목록(배열)을 JSON 형태로 프론트에 보냄
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
);

//메일 보내서 임시비밀번호로 비밀번호 변경
userRouter.post("/mail", async (req, res, next) => {
  // 인증번호 생성
  const generateRandomString = () => {
    const charList = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '?!@', '0123456789'];

    let result = '';
    let selectedChar = '';

    for (let i = 0; i < 8; i++) {
      if (i < 4) selectedChar = charList[i];
      else selectedChar = charList[Math.floor(Math.random() * 4)];

      result += selectedChar.charAt(Math.floor(Math.random() * selectedChar.length));
    }

    return result;
  }

  let randomStr = generateRandomString();

  // nodeMailer 옵션
  const mailOptions = {
    from: "Mergecake@gmail.com",
    //process.env.NODEMAILER_USER,
    to: req.body.EMAIL,
    subject: "임시 비밀번호 발급.",
    text: "임시 비밀번호입니다. " + randomStr,
    html: `
      <div style="text-align: center; background-color: #FEF7FF;" >
        <div style="background-color: #2C7CB7"; width: 200px;>
        <p style="color: #B975D9; font-size: 50px; font-width: bold;" >MergeCake</p>
        </div>
        <h1 style="color: #B975D9">임시 비밀번호 발급</h1>
        <br />
        <p>임시비밀번호가 발급되었습니다.</p>
        <p>${randomStr}</p>
        <p>임시 비밀번호로 로그인 후 비밀번호를 변경해주세요</p>
      </div>
    `,
  };

  try {
    const { EMAIL } = req.body;
    const users = await userService.setPassword(EMAIL, randomStr);

    //   // 사용자 목록(배열)을 JSON 형태로 프론트에 보냄
    //   res.status(200).json(users);
    // } catch (error) {
    //   next(error);
    // }

    // // 메일 전송
    // try {
    await transPort.sendMail(mailOptions, function (error, info) {
      console.log(mailOptions);
      if (error) {
        console.log(error);
      }
      res.status(200).json(randomStr);
      transPort.close();
    });
  } catch (e) {
    next(e);
  }
});

export { userRouter };
