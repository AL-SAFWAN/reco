import {
  Body,
  Button,
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

interface EnrollmentConfirmedEmailProps {
  firstName: string;
  curriculumTitle: string;
  curriculumUrl: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const EnrollmentConfirmedEmail = ({
  firstName = "{{firstName}}",
  curriculumTitle = "{{curriculumTitle}}",
  curriculumUrl = "{{curriculumUrl}}",
}: EnrollmentConfirmedEmailProps) => {
  const previewText = `You're enrolled in ${curriculumTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[0px]">
              <Img
                src={`${baseUrl}/static/unnamed.gif`}
                width="40"
                height="37"
                alt="Legion"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              You're enrolled!
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hi {firstName},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              You've successfully enrolled in <strong>{curriculumTitle}</strong>
              . Your learning journey starts now — dive in whenever you're
              ready.
            </Text>
            <Section className="my-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={curriculumUrl}
              >
                Start Learning
              </Button>
            </Section>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              You're receiving this because you enrolled in a curriculum on
              RECo.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EnrollmentConfirmedEmail;
