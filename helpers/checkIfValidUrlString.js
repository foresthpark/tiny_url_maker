import isURL from "validator/lib/isURL";

const checkIfValidUrlString = (urlString) => {
  if (urlString.length < 1) {
    return false;
  }
  return isURL(urlString);
};

export default checkIfValidUrlString;
