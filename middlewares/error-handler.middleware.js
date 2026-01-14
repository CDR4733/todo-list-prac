export default (err, req, res, next) => {
  console.log("에러 처리 미들웨어가 실행되었습니다!");
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ erreorMessage: err.message });
  }

  return res.status(500).json({ errorMessage: "서버 에러 발생!" });
};
