/** Supabase Auth error codes → Mongolian; anything else gets a generic message. */
const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'Имэйл эсвэл нууц үг буруу байна.',
  email_not_confirmed: 'Имэйлээ баталгаажуулаагүй байна. Ирсэн захидлын холбоосыг дарна уу.',
  user_already_exists: 'Энэ имэйлээр бүртгэл үүссэн байна. Нэвтэрнэ үү.',
  weak_password: 'Нууц үг хэт сул байна. Дор хаяж 6 тэмдэгт оруулна уу.',
  same_password: 'Шинэ нууц үг одоогийнхоосоо өөр байх ёстой.',
  reauthentication_needed: 'Аюулгүй байдлын үүднээс гараад дахин нэвтэрч ороод оролдоно уу.',
  session_not_found: 'Нэвтрэлтийн хугацаа дууссан байна. Дахин нэвтэрнэ үү.',
  over_email_send_rate_limit: 'Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу.',
  over_request_rate_limit: 'Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу.',
  validation_failed: 'Имэйл хаяг буруу байна.',
};

export function authErrorMessage(code: string | undefined): string {
  return AUTH_ERRORS[code ?? ''] ?? 'Алдаа гарлаа. Дахин оролдоно уу.';
}
