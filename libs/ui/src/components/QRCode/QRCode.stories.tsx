import type { Meta, StoryObj } from '@storybook/react';
import { QRCode } from './QRCode';

const meta = {
  title: 'Components/QRCode',
  component: QRCode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 128, max: 512, step: 32 },
    },
  },
} satisfies Meta<typeof QRCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'https://bellybearsings.com/party/abc123',
  },
};

export const WithTitle: Story = {
  args: {
    value: 'https://bellybearsings.com/party/abc123',
    title: 'Scan to Join Party',
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    value: 'https://bellybearsings.com/party/abc123',
    title: 'Scan to Join Party',
    subtitle: 'Or share this link: bellybearsings.com/party/abc123',
  },
};

export const Small: Story = {
  args: {
    value: 'https://bellybearsings.com/party/abc123',
    size: 128,
    title: 'Join Party',
  },
};

export const Large: Story = {
  args: {
    value: 'https://bellybearsings.com/party/abc123',
    size: 384,
    title: 'Scan to Join the Karaoke Party!',
    subtitle: 'Point your camera at this code',
  },
}; 