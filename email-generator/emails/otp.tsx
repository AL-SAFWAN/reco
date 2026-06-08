import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/componentss";
import * as React from "react";

interface VercelOtpEmailProps {
  firstName: string;
  otpCode: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const VercelOtpEmail = ({
  otpCode = "{{otpCode}}",
}: VercelOtpEmailProps) => {
  const previewText = `Your OTP Code – Legion Grappling Academy`;
  // const formattedOtp =
  //   otpCode.length === 6
  //     ? `${otpCode.slice(0, 3)}◦${otpCode.slice(3)}`
  //     : otpCode;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px]  mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[0px]">
              <Img
                src={`${baseUrl}/static/unnamed.gif`}
                width="40"
                height="37"
                alt="Legion Grappling Academy Logo"
                className="my-0 mx-auto aspect-square size-32 object-contain"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 mb-[30px] mx-0 mt-0">
              <strong>Legion Grappling Academy</strong>
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Hello,
            </Text>

            <Text className="text-black text-[14px] leading-[24px] mt-2">
              Your One-Time Password (OTP) is:
            </Text>
            <Section className="bg-zinc-200 rounded-md">
              <Text className="text-black text-[28px] font-semibold tracking-widest text-center my-4 font-mono">
                {otpCode}
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Enter this code to complete your login or registration. This code
              will expire in 5 minutes.
            </Text>

            <Text className="text-black text-[14px] leading-[24px] mt-6">
              If you didn't request this OTP, please ignore this email.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full mb-0" />
            <Text className="text-xs text-zinc-400">
              Legion Grappling Academy Unit 5 Transform House, London, LDN E10
              7QF 02034908660
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VercelOtpEmail.PreviewProps = {
  otpCode: "123◦456",
} as VercelOtpEmailProps;

export default VercelOtpEmail;
