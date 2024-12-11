import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Link, Text, Box } from '@radix-ui/themes';
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div>
      <Heading
        as="h1"
        size="8"
        mb="2"
        style={{ scrollMarginTop: 'var(--space-9)' }}
      >
        Privacy Policy
      </Heading>
      <Box mt="2" mb="7">
        <Flex direction="column" gap="4" pt="4" pb="4">
          <Text size="4" color="gray" as="p">
            At WhoAmI, we are committed to protecting your privacy and ensuring
            the security of your personal information. This Privacy Policy
            outlines how we collect, use, disclose, and protect the data you
            provide to us when using our platform.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Information We Collect:</strong> When you create an account
            on WhoAmI, we collect certain personal information, such as your
            name, email address, and profile details. We may also collect
            additional information you choose to provide, such as your
            interests, hobbies, and life experiences.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Use of Information:</strong> We use the information we
            collect to provide and improve our services, personalize your
            experience, and communicate with you. This includes displaying your
            profile information to other users, recommending connections based
            on shared interests, and sending you relevant notifications and
            updates.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Data Sharing:</strong> We do not sell, trade, or rent your
            personal information to third parties. However, we may share your
            data with trusted service providers who assist us in operating our
            platform, conducting our business, or servicing you, as long as
            those parties agree to keep this information confidential.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Data Security:</strong> We implement a variety of security
            measures to maintain the safety of your personal information. This
            includes encryption, secure servers, and restricted access to your
            data. However, please be aware that no method of transmission over
            the internet or electronic storage is 100% secure.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Your Choices:</strong> You have control over the information
            you share on WhoAmI. You can update your profile, manage your
            privacy settings, and choose what information is visible to others.
            You can also opt-out of receiving certain communications from us.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Changes to this Policy:</strong> We may update our Privacy
            Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page. You are advised to
            review this Privacy Policy periodically for any changes.
          </Text>
          <Text size="4" color="gray" as="p">
            If you have any questions or concerns about our Privacy Policy,
            please contact us.
          </Text>
        </Flex>
        <Flex
          direction={{ initial: 'column', xs: 'row' }}
          gap={{ initial: '3', xs: '5' }}
          mt="5"
        >
          <Flex asChild display="inline-flex" align="center" gap="2">
            <Link size="3" target="_blank" href="mailto:info@whoami.page">
              Contact us
              <Box asChild style={{ color: 'var(--gray-9)' }}>
                <ArrowTopRightIcon />
              </Box>
            </Link>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
};

export default PrivacyPolicy;
