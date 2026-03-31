import { render, screen } from "@testing-library/react";

import Base64Encoder from "../../../pages/utilities/base-64-encoder";
import Base64ToImage from "../../../pages/utilities/base64-to-image";
import CameraUtility from "../../../pages/utilities/cam";
import CssInliner from "../../../pages/utilities/css-inliner-for-email";
import CssUnitsConverter from "../../../pages/utilities/css-units-converter";
import CSVtoJSON from "../../../pages/utilities/csv-to-json";
import CurlToFetch from "../../../pages/utilities/curl-to-javascript-fetch";
import EnvToToml from "../../../pages/utilities/env-to-netlify-toml";
import HARFileViewer from "../../../pages/utilities/har-file-viewer";
import HashGenerator from "../../../pages/utilities/hash-generator";
import HexToRGB from "../../../pages/utilities/hex-to-rgb";
import ImageResizer from "../../../pages/utilities/image-resizer";
import ImageToBase64 from "../../../pages/utilities/image-to-base64";
import InternetSpeedTest from "../../../pages/utilities/internet-speed-test";
import JSONFormatter from "../../../pages/utilities/json-formatter";
import JSONtoCSV from "../../../pages/utilities/json-to-csv";
import JSONtoYAML from "../../../pages/utilities/json-to-yaml";
import JWTParser from "../../../pages/utilities/jwt-parser";
import LoremIpsumGenerator from "../../../pages/utilities/lorem-ipsum-generator";
import NumberBaseChanger from "../../../pages/utilities/number-base-changer";
import QueryParamsToJSON from "../../../pages/utilities/query-params-to-json";
import RandomStringGenerator from "../../../pages/utilities/random-string-generator";
import RegexTester from "../../../pages/utilities/regex-tester";
import RGBToHex from "../../../pages/utilities/rgb-to-hex";
import SQLMinifier from "../../../pages/utilities/sql-minifier";
import SVGViewer from "../../../pages/utilities/svg-viewer";
import TimestampToDate from "../../../pages/utilities/timestamp-to-date";
import URLEncoder from "../../../pages/utilities/url-encoder";
import UuidGenerator from "../../../pages/utilities/uuid-generator";
import WcagColorContrastChecker from "../../../pages/utilities/wcag-color-contrast-checker";
import WebpConverter from "../../../pages/utilities/webp-converter";
import XMLtoJSON from "../../../pages/utilities/xml-to-json";
import YAMLtoJSON from "../../../pages/utilities/yaml-to-json";

jest.mock("@cloudflare/speedtest", () => {
  return class MockSpeedTestEngine {
    results = {
      getSummary: () => ({}),
    };
    play = jest.fn();
    pause = jest.fn();
    onResultsChange = () => {};
    onFinish = () => {};
    onError = () => {};
  };
});

const utilities = [
  Base64Encoder,
  Base64ToImage,
  CameraUtility,
  CssInliner,
  CssUnitsConverter,
  CSVtoJSON,
  CurlToFetch,
  EnvToToml,
  HARFileViewer,
  HashGenerator,
  HexToRGB,
  ImageResizer,
  ImageToBase64,
  InternetSpeedTest,
  JSONFormatter,
  JSONtoCSV,
  JSONtoYAML,
  JWTParser,
  LoremIpsumGenerator,
  NumberBaseChanger,
  QueryParamsToJSON,
  RandomStringGenerator,
  RegexTester,
  RGBToHex,
  SQLMinifier,
  SVGViewer,
  TimestampToDate,
  URLEncoder,
  UuidGenerator,
  WcagColorContrastChecker,
  WebpConverter,
  XMLtoJSON,
  YAMLtoJSON,
];

describe("utilities smoke", () => {
  test.each(utilities)("renders utility page", (UtilityPage) => {
    render(<UtilityPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
