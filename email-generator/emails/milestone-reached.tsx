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

interface MilestoneReachedEmailProps {
  firstName: string;
  curriculumTitle: string;
  percent: number;
  curriculumUrl: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const MilestoneReachedEmail = ({
  firstName = "{{firstName}}",
  curriculumTitle = "{{curriculumTitle}}",
  percent = 50,
  curriculumUrl = "{{curriculumUrl}}",
}: MilestoneReachedEmailProps) => {
  const previewText = `You're ${percent}% through ${curriculumTitle}!`;

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
              You're halfway there! 🔥
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hi {firstName},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              You've completed <strong>{percent}%</strong> of{" "}
              <strong>{curriculumTitle}</strong>. Keep up the momentum — you're
              making great progress.
            </Text>
            <Section className="my-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={curriculumUrl}
              >
                Continue Learning
              </Button>
            </Section>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              You're receiving this because you're enrolled in a curriculum on
              Legion Grappling Academy.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MilestoneReachedEmail;
