import express from "express";
import connect from "./schemas/index.js";
import todosRouter from "./routes/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

// mongoose 연결
connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적인 파일을 서빙해주는 미들웨어 사용 (assets폴더 속 파일들을 그대로 사용 가능)
app.use(express.static("./assets"));

// 로그를 남기는 미들웨어 (테스트)
// 미들웨어는 app.js 전체에서 위에서부터 순서대로 실행된다. 따라서 순서 유의.
app.use((req, res, next) => {
  console.log("Request URL:", req.originalUrl, " - ", new Date());
  // 미들웨어에서 next 또는 res.json이 없으면 무한대기 상태가 된다.
  next();
  // 만약 res.json과 next를 둘 다 쓰게 되면 응답이 2개가 되므로 에러남!
});

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

// api 실행 미들웨어
app.use("/api", [router, todosRouter]);

// 에러처리 미들웨어 (라우터 다음에 에러가 발생하므로 순서는 여기에)
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
