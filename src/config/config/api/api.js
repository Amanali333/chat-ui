import axios from "axios";

export const createAPIEndPoint = (endpoint) => {
  const BASE_URL = process.env.REACT_APP_URL;

  let token =
    typeof localStorage !== "undefined" && localStorage.getItem("ecommerceToken");

  let url = `${BASE_URL}/${endpoint}/`;
  return {
    fetchAll: () =>
      axios.get(
        url,
        token !== null && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    create: (newRecord) =>
      axios.post(
        url,
        newRecord,
        token !== null && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    fetchById: (id) =>
      axios.get(
        url + id,
        token !== null && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    delete: (id) =>
      axios.delete(
        url + id,
        token !== null && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    fetchFiltered: (params) =>
      axios.get(
        url,
        params,
        token !== null && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    update: (id, updatedRecord) =>
      axios.put(
        url + id,
        updatedRecord,
        token !== null && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
  };
};
