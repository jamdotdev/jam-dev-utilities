import {
  formatSpeed,
  formatLatency,
  formatPacketLoss,
  getSpeedCategory,
} from "./internet-speed-test.utils";

// Mock the @cloudflare/speedtest module to avoid import issues in Jest
jest.mock('@cloudflare/speedtest', () => ({
  default: jest.fn(),
  Results: jest.fn(),
}));

describe("Internet Speed Test Utils", () => {
  describe("formatSpeed", () => {
    it("should format speeds in Kbps for values under 1 Mbps", () => {
      expect(formatSpeed(500_000)).toBe("500 Kbps");
      expect(formatSpeed(100_000)).toBe("100 Kbps");
    });

    it("should format speeds in Mbps for values under 1 Gbps", () => {
      expect(formatSpeed(1_000_000)).toBe("1.0 Mbps");
      expect(formatSpeed(50_000_000)).toBe("50.0 Mbps");
      expect(formatSpeed(999_000_000)).toBe("999.0 Mbps");
    });

    it("should format speeds in Gbps for values over 1 Gbps", () => {
      expect(formatSpeed(1_000_000_000)).toBe("1.0 Gbps");
      expect(formatSpeed(2_500_000_000)).toBe("2.5 Gbps");
    });

    it("should handle invalid values", () => {
      expect(formatSpeed(undefined)).toBe("0 Mbps");
      expect(formatSpeed(0)).toBe("0 Mbps");
      expect(formatSpeed(-100)).toBe("0 Mbps");
    });
  });

  describe("formatLatency", () => {
    it("should format latency in milliseconds", () => {
      expect(formatLatency(50)).toBe("50 ms");
      expect(formatLatency(15.6)).toBe("16 ms");
      expect(formatLatency(100.9)).toBe("101 ms");
    });

    it("should handle invalid values", () => {
      expect(formatLatency(undefined)).toBe("0 ms");
      expect(formatLatency(0)).toBe("0 ms");
      expect(formatLatency(-50)).toBe("0 ms");
    });
  });

  describe("formatPacketLoss", () => {
    it("should format packet loss as percentage", () => {
      expect(formatPacketLoss(0.1)).toBe("10.0%");
      expect(formatPacketLoss(0.05)).toBe("5.0%");
      expect(formatPacketLoss(0.001)).toBe("0.1%");
    });

    it("should handle invalid values", () => {
      expect(formatPacketLoss(undefined)).toBe("0%");
      expect(formatPacketLoss(0)).toBe("0%");
      expect(formatPacketLoss(-0.1)).toBe("0%");
    });
  });

  describe("getSpeedCategory", () => {
    it("should categorize excellent speeds", () => {
      const result = getSpeedCategory(150);
      expect(result.category).toBe("Excellent");
      expect(result.color).toBe("text-green-600");
      expect(result.description).toContain("4K");
    });

    it("should categorize very good speeds", () => {
      const result = getSpeedCategory(75);
      expect(result.category).toBe("Very Good");
      expect(result.color).toBe("text-blue-600");
      expect(result.description).toContain("HD");
    });

    it("should categorize good speeds", () => {
      const result = getSpeedCategory(40);
      expect(result.category).toBe("Good");
      expect(result.color).toBe("text-yellow-600");
      expect(result.description).toContain("streaming");
    });

    it("should categorize fair speeds", () => {
      const result = getSpeedCategory(10);
      expect(result.category).toBe("Fair");
      expect(result.color).toBe("text-orange-600");
      expect(result.description).toContain("Basic");
    });

    it("should categorize poor speeds", () => {
      const result = getSpeedCategory(2);
      expect(result.category).toBe("Poor");
      expect(result.color).toBe("text-red-600");
      expect(result.description).toContain("Limited");
    });

    it("should handle edge cases", () => {
      expect(getSpeedCategory(100).category).toBe("Excellent");
      expect(getSpeedCategory(50).category).toBe("Very Good");
      expect(getSpeedCategory(25).category).toBe("Good");
      expect(getSpeedCategory(5).category).toBe("Fair");
    });
  });
});