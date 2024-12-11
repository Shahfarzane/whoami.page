import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { Flex, Heading, Link, Text, Box } from '@radix-ui/themes';
import React from 'react';

const TermsOfService = () => {
  return (
    <div>
      <Heading
        as="h1"
        size="8"
        mb="2"
        style={{ scrollMarginTop: 'var(--space-9)' }}
      >
        Terms of Service
      </Heading>
      <Box mt="2" mb="7">
        <Flex direction="column" gap="4" pt="4" pb="4">
          <Text size="4" color="gray" as="p">
            Welcome to WhoAmI! These Terms of Service govern your use of our
            platform. By accessing or using WhoAmI, you agree to be bound by
            these terms. Please read them carefully.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>User Accounts:</strong> To access certain features of
            WhoAmI, you may be required to create an account. You are
            responsible for maintaining the confidentiality of your account
            information and for all activities that occur under your account.
            You agree to provide accurate and complete information when creating
            your account.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>User Content:</strong> WhoAmI allows you to create, upload,
            and share content, such as profile information, posts, and comments.
            You retain ownership of the content you submit, but by sharing it on
            WhoAmI, you grant us a worldwide, non-exclusive, royalty-free
            license to use, reproduce, modify, adapt, publish, and distribute
            such content in connection with our platform.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Prohibited Conduct:</strong> You agree not to use WhoAmI for
            any unlawful or prohibited purpose. This includes, but is not
            limited to, posting defamatory, obscene, or offensive content,
            infringing upon intellectual property rights, harassing other users,
            or engaging in any activity that may disrupt or interfere with the
            functioning of our platform.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Intellectual Property:</strong> WhoAmI and its original
            content, features, and functionality are owned by us and are
            protected by international copyright, trademark, patent, trade
            secret, and other intellectual property or proprietary rights laws.
            You agree not to copy, modify, distribute, or create derivative
            works based on our platform without our prior written consent.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Termination:</strong> We reserve the right to terminate or
            suspend your access to WhoAmI at any time, without prior notice or
            liability, for any reason whatsoever, including, without limitation,
            if you breach these Terms of Service.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Disclaimer of Warranties:</strong> WhoAmI is provided on an
            "as is" and "as available" basis. We make no representations or
            warranties of any kind, express or implied, as to the operation of
            our platform or the information, content, materials, or products
            included on WhoAmI.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Limitation of Liability:</strong> In no event shall WhoAmI
            or its directors, employees, partners, agents, or affiliates be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or relating to your use of our
            platform.
          </Text>
          <Text size="4" color="gray" as="p">
            <strong>Modifications:</strong> We reserve the right, at our sole
            discretion, to modify or replace these Terms of Service at any time.
            If a revision is material, we will provide at least 30 days' notice
            prior to any new terms taking effect. By continuing to access or use
            WhoAmI after any revisions become effective, you agree to be bound
            by the revised terms.
          </Text>
          <Text size="4" color="gray" as="p">
            If you have any questions about these Terms of Service, please
            contact us at.
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

export default TermsOfService;
