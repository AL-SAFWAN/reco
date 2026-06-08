import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/componentss";
import * as React from "react";

interface ForgotPasswordEmailProps {
  firstName: string;
  resetPasswordLink: string;
  validMins: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const ForgotPasswordEmail = ({
  firstName = "{{firstName}}",
  validMins = "{{validMins}}",
  resetPasswordLink = "{{resetPasswordLink}}",
}: ForgotPasswordEmailProps) => {
  const previewText = "Reset Your Password for Legion Grappling Academy";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-gray-200 rounded my-10 mx-auto p-6 max-w-md">
            {/* Logo Section */}
            <Section className="mt-0 text-center">
              <Img
                src={`${baseUrl}/static/unnamed.gif`}
                width="40"
                height="37"
                alt="Vercel"
                className="my-0 mx-auto aspect-square size-32 object-contain invert-0  "
              />
            </Section>

            {/* Heading */}
            <Heading className="text-black text-2xl font-normal text-center p-0 mb-6 mx-0 mt-0">
              <strong>Reset Your Password</strong>
            </Heading>

            {/* Greeting */}
            <Text className="text-black text-base leading-6">
              Hello {firstName},
            </Text>

            {/* Password Reset Message */}
            <Text className="text-black text-base leading-6">
              We received a request to reset your password for your Legion
              Grappling Academy account. If you made this request, please click
              the button below to set a new password:
            </Text>

            {/* Reset Password Button */}

            <Button
              className="bg-[#000000] rounded text-white text-[16px] font-semibold no-underline text-center w-full py-3 "
              href={resetPasswordLink}
            >
              Reset Your Password
            </Button>

            {/* Security Notice */}
            <Text className="text-black text-base leading-6">
              For your security, this link will expire in {validMins} minutes
              and can only be used once.
            </Text>

            <Hr className="border border-solid border-gray-200 my-6 mx-0 w-full" />

            {/* If You Didn't Request This */}
            <Text className="text-black text-base leading-6">
              If you did not request a password reset, please ignore this email.
              Your password will remain unchanged.
            </Text>

            {/* Support Information */}
            <Text className="text-black text-base leading-6">
              If you have any questions or need further assistance, feel free to
              reach out to our support team at{" "}
              <Link
                href="mailto:grapple@legiongrappling.com"
                className="text-blue-600 no-underline"
              >
                grapple@legiongrappling.com
              </Link>
              .
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full mb-0" />
            <Text className=" text-xs text-zinc-400">
              Legion Grappling Academy Unit 5 Transform House, London, LDN E10
              7QF 02034908660
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ForgotPasswordEmail.PreviewProps = {
  firstName: "John",
  resetPasswordLink:
    "https://www.legiongrappling.com/reset-password?token=abc123",
  validMins: "60",
} as ForgotPasswordEmailProps;

export default ForgotPasswordEmail;
