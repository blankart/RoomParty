import zod from "zod";

export const registerSchema = zod
  .object({
    email: zod.string().email(),
    password: zod.string().min(8),
    password2: zod.string().min(8),
    agreeToTermsAndConditions: zod.boolean(),
  })
  .superRefine(({ password, password2, agreeToTermsAndConditions }, ctx) => {
    if (password !== password2) {
      ctx.addIssue({
        path: ["password2"],
        code: "custom",
        message: "Passwords did not match.",
      });
    }

    if (!agreeToTermsAndConditions) {
      ctx.addIssue({
        path: ["agreeToTermsAndConditions"],
        code: "custom",
        message: "You must agree to terms and conditions",
      });
    }
  });

export const confirmVerificationCodeSchema = zod.object({
  email: zod.string().email(),
  code: zod.string().length(6),
});

export const resendVerificationCodeSchema = zod.object({
  email: zod.string().email(),
});

export const getVerificationDetailsSchema = zod.object({
  accountId: zod.string(),
});
