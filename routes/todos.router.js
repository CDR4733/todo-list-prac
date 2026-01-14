import express from "express";
import Todo from "../schemas/todo.schema.js";
import joi from "joi";

const router = express.Router();

/** 조이를 활용한 유효성 검사 **/
// value는 문자열.최소1글자.최대50글자.필수입력
// 유효성 검사에 실패했을 때 에러가 발생하도록!
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/** 할 일 등록(C) API **/
router.post("/todos", async (req, res, next) => {
  try {
    // 1. 클라이언트로부터 받아온 value 데이터 가져오기
    const validation = await createdTodoSchema.validateAsync(req.body);
    const { value } = validation;

    // 1-1. 만약 클라이언트가 value 데이터를 전달하지 않았을 때
    // 클라이언트에게 에러메시지를 반환
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: "해야할 일(value) 데이터가 존재하지 않습니다." });
    }
    // 2. 해당하는 마지막 order 데이터를 조회
    // 내림차순: -order // 프로미스 타입으로 반환: exec
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();
    // 3. 만약 존재한다면 현재 할 일을 +1 하고,
    // order 데이터가 존재하지 않는다면 1로 할당
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;
    // 4. 할 일을 등록
    const todo = new Todo({ value, order });
    await todo.save();
    // 5. 클라이언트에 결과 반환
    return res.status(201).json({ todo: todo });
  } catch (err) {
    // Router 다음에 있는 에러처리미들웨어로 전달
    next(err);
  }
});

/** 할 일 목록 조회(R-A) API **/
router.get("/todos", async (req, res, next) => {
  // 1. 할 일 목록 조회
  const todos = await Todo.find().sort("-order").exec();
  // 2. 클라이언트에 결과 반환
  return res.status(200).json({ todos });
});

/** 할 일 변경(U) API **/
router.patch("/todos/:todoId", async (req, res, next) => {
  // 1. 클라이언트로부터 받은 변수 저장
  const { todoId } = req.params;
  const { order, done, value } = req.body;
  // 2. 현재 나의 order가 무엇인지? 그리고 order 변경!
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({ errorMessage: "존재하지 않는 할 일입니다." });
  }
  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    currentTodo.order = order;
  }
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }
  if (value) {
    currentTodo.value = value;
  }
  await currentTodo.save();
  // 3. 클라이언트에 결과 반환
  return res.status(200).json({ message: "수정 성공!" });
});

/** 할 일 삭제(D) API **/
router.delete("/todos/:todoId", async (req, res, next) => {
  // 1. 클라이언트로부터 받은 변수
  const { todoId } = req.params;
  // 2. 해당 할 일이 존재하는가 확인
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res.status(404).json({ errorMessage: "존재하지 않는 할 일입니다." });
  }
  // 3. 존재한다면 삭제
  await Todo.deleteOne({ _id: todoId });
  // 4. 클라이언트에 결과 반환
  return res.status(200).json({ message: "삭제 성공!" });
});

export default router;
