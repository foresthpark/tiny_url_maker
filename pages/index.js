import Head from "next/head";
import React, { useState, useRef, useEffect } from "react";
import checkIfValidUrlString from "../helpers/checkIfValidUrlString";
import getApiKey from "../helpers/getApiKey";
const copy = require("copy-text-to-clipboard");
const shortid = require("shortid");
import { Spin, message } from "antd";
import "antd/dist/antd.css";
import axios from "axios";

// https://blog.ruanbekker.com/blog/2018/11/30/how-to-setup-a-serverless-url-shortener-with-api-gateway-lambda-and-dynamodb-on-aws/

export default function Home() {
  const [urlInput, setUrlInput] = useState("");
  const [copyString, setCopyString] = useState("");
  const [urlCollection, setUrlCollection] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  const getTinyUrls = async () => {
    try {
      const response = await axios.get(
        "https://2vew1r30z8.execute-api.us-west-2.amazonaws.com/test/t"
      );

      const data = response.data.body.Items;
      setUrlCollection(data);
    } catch (err) {
      console.log(err);
    }
  };

  const createTinyUrl = async (urlString) => {
    const shortId = shortid.generate();

    const data = {
      shortId: shortId,
      shortUrl: "https://tiny.forestparkdev.ca/t/" + shortId,
      fullUrl: urlString,
    };

    try {
      const response = await axios.post(
        "https://tiny.forestparkdev.ca/create",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "x-api-key": getApiKey(),
          },
        }
      );
    } catch (err) {
      console.log(err);
    }

    return data;
  };

  useEffect(() => {
    getTinyUrls();
  }, []);

  const generateTtlDate = () => {
    const now = new Date();
    // Add 6 days
    return now.setDate(now.getDate() + 6);
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    setLoadingState(true);

    const result = checkIfValidUrlString(urlInput);

    if (!result) {
      window.alert(`${urlInput} is not a valid URL`);
      setUrlInput("");
      return;
    }

    const data = await createTinyUrl(urlInput);

    setUrlCollection([...urlCollection, data]);
    setLoadingState(false);
    setUrlInput("");
    return;
  };

  const handleInputChange = (e) => {
    setUrlInput(e.target.value);
  };

  const copyToClipboard = (urlString) => {
    copy(urlString);
    message.success("Tiny URL Copied to Clipboard! ✅");
  };

  const urlsMap = urlCollection.map((urlObj, index) => {
    const isOdd = (number) => {
      return number % 2 === 1;
    };
    const rowLen = urlCollection.length;

    if (rowLen === index + 1) {
      // last one
      return (
        <div
          key={urlObj.shortId}
          className={
            isOdd(index)
              ? "bg-white flex justify-center items-center w-5/6 px-2 h-12 mb-5 rounded-b-xl shadow-md  "
              : "bg-blue-100 flex justify-center items-center w-5/6 px-2 mb-5 h-12 rounded-b-xl shadow-md"
          }
        >
          <div className="w-1/2 text-center px-3">{urlObj.fullUrl}</div>
          <div className="w-1/3 text-center">{urlObj.shortUrl}</div>
          <div className="w-1/5 text-center">
            <button
              className="bg-blue-900 text-blue-100 rounded-lg shadow-md submit-btn font-semibold p-1"
              onClick={() => copyToClipboard(urlObj.shortUrl)}
            >
              Copy
            </button>
          </div>
        </div>
      );
    } else {
      // NOT last one
      return (
        <div
          key={urlObj.shortId}
          className={
            isOdd(index)
              ? "bg-white flex justify-center items-center w-5/6 px-2 h-12 "
              : "bg-blue-100 flex justify-center items-center w-5/6 px-2 h-12 "
          }
        >
          <div className="w-1/2 text-center px-3">{urlObj.fullUrl}</div>
          <div className="w-1/3 text-center">{urlObj.shortUrl}</div>
          <div className="w-1/5 text-center">
            <button
              className="bg-blue-900 text-blue-100 rounded-lg shadow-md submit-btn font-semibold p-1 "
              onClick={() => copyToClipboard(urlObj.shortUrl)}
            >
              Copy
            </button>
          </div>
        </div>
      );
    }
  });

  return (
    <Spin size="large" spinning={loadingState} delay={150}>
      <div className="h-screen w-screen flex flex-col items-center pt-20 bg-blue-200">
        <Head>
          <title>Shrinkem</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {/* LOGO */}
        <div className="font-bold font-sans text-7xl m-8 text-gray-800">
          Shrink your site URLs
        </div>
        <div className="text-gray-700 text-sm font-bold select-none w-screen flex justify-center items-center">
          {/* <label className="m-3" for="full_name">
          Full Name
        </label> */}
          <form className="flex justify-center w-1/3" onSubmit={handleOnSubmit}>
            <input
              id="full_url"
              placeholder="Enter the URL you want to shrink"
              className="p-5 m-3 shadow-md border rounded-lg w-full font-bold"
              name="urlInput"
              value={urlInput}
              onChange={handleInputChange}
            />
            <button
              className="m-3 px-10 bg-blue-900 text-blue-100 rounded-lg shadow-md submit-btn font-bold"
              type="submit"
            >
              Shorten
            </button>
          </form>
        </div>

        {/* Table Div starts here */}
        <div className="w-4/6 flex flex-col justify-center items-center bg-blue-200 ">
          {/* Div header */}
          <div className="flex justify-center items-center w-5/6 mt-8 px-2 h-12 rounded-t-xl bg-blue-900 font-bold font-sans text-gray-100">
            <div className="w-1/2 text-center">Full URL</div>
            <div className="w-1/3 text-center">Short URL</div>
            <div className="w-1/5 text-center">Copy</div>
          </div>
          {/* Div content - Dynamically generated */}
          {!urlCollection ? "Loading" : urlsMap}
        </div>
      </div>
    </Spin>
  );
}
