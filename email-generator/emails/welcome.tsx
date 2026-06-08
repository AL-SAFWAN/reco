import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/componentss";
import * as React from "react";

interface VercelInviteUserEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  redirect: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const VercelInviteUserEmail = ({
  firstName = "{{firstName}}",
  lastName = "{{lastName}}",
  email = "{{email}}",
  redirect = "{{redirect}}",
}: VercelInviteUserEmailProps) => {
  const previewText = `Welcome to legion grappling academy`;

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
                alt="Vercel"
                className="my-0 mx-auto aspect-square size-32 object-contain invert-0  "
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 mb-[30px]  mx-0 mt-0">
              <strong>
                Welcome to <br />
                Legion Grappling Academy!
              </strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {firstName},
            </Text>
            {/* Welcome Message */}
            <Text className="text-black text-[14px] leading-[24px] ">
              Thank you for creating an account with us online. We're thrilled
              to have you join our community of grapplers.
            </Text>
            {/* User Account Details */}
            <Text className="text-black text-[14px] leading-[24px] mt-4 !mb-0">
              For your records, your account details are listed below:
            </Text>
            <div className="text-black text-[14px] leading-[20px] !ml-2 !mt-2 ">
              <li>
                <strong>First Name:</strong> {firstName}
              </li>
              <li>
                <strong>Last Name:</strong> {lastName}
              </li>
              <li>
                <strong>Email:</strong> {email}
              </li>
            </div>
            <Text className="text-black text-[14px] leading-[24px]">
              However, to complete your account, additional information is
              required. Please click the button below to provide the necessary
              details and start your journey with us.
            </Text>

            {/* Complete Your Account Button */}
            <Button
              className="bg-[#000000] rounded text-white text-[16px] font-semibold no-underline text-center w-full py-3 "
              href={redirect}
            >
              Complete Your Account
            </Button>
            {/* Divider */}
            {/* <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" /> */}

            {/* MindBody Account Information */}
            {/* <Text className="text-black text-[14px] leading-[24px] font-bold">
              Your MindBody Account Has Been Created
            </Text> */}
            {/* <Text className="text-black text-[14px] leading-[24px]">
              To enhance your experience, we've set up a{" "}
              <strong>MindBody</strong> account for you using the email address{" "}
              <em>{email}</em>.
            </Text> */}

            {/* Support Information */}
            {/* <Text className="text-black text-[14px] leading-[24px]">
              If you have any questions or need assistance accessing your
              MindBody account, feel free to reach out to our support team at{" "}
              <Link
                href="mailto:grapple@legiongrappling.com"
                className="text-blue-600 no-underline"
              >
                grapple@legiongrappling.com
              </Link>
              .
            </Text> */}

            {/* Divider */}
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

VercelInviteUserEmail.PreviewProps = {
  firstName: "John",
  lastName: "doe",
  email: "john.doe@example.com",
  redirect: "http://localhost:3000/",
} as VercelInviteUserEmailProps;

export default VercelInviteUserEmail;
