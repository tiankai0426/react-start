import { isObject, forEach, isArray } from "lodash";
import { stringify } from "querystring";
import { IRequestActor } from "./createRequest";

const getContentType = (headers: any = {}) => headers["Content-Type"] || headers["content-type"] || "";

export const isContentTypeMultipartFormData = (headers: any) => getContentType(headers).includes("multipart/form-data");

export const isContentTypeFormURLEncoded = (headers: any) =>
  getContentType(headers).includes("application/x-www-form-urlencoded");

export const isContentTypeJSON = (headers: any) => {
  return getContentType(headers).includes("application/json");
};

export const paramsSerializer = (params: any) => {
  const data = {} as any;

  const add = (k: string, v: string) => {
    if (typeof v === "undefined" || String(v).length === 0) {
      return;
    }

    if (data[k]) {
      data[k] = ([] as string[]).concat(data[k]).concat(v);
      return;
    }

    data[k] = v;
  };

  const appendValue = (k: string, v: any) => {
    if (isArray(v)) {
      forEach(v, (item) => appendValue(k, item));
    } else if (isObject(v)) {
      add(k, JSON.stringify(v));
    } else {
      add(k, v);
    }
  };

  forEach(params, (v, k) => appendValue(k, v));

  return stringify(data);
};

export const transformRequest = (data: any, headers: any) => {
  if (isContentTypeMultipartFormData(headers)) {
    const formData = new FormData();

    const appendValue = (k: string, v: any) => {
      if (v instanceof File || v instanceof Blob) {
        formData.append(k, v);
      } else if (isArray(v)) {
        forEach(v, (item) => appendValue(k, item));
      } else if (isObject(v)) {
        formData.append(k, JSON.stringify(v));
      } else {
        formData.append(k, v);
      }
    };

    forEach(data, (v, k) => appendValue(k, v));

    return formData;
  }

  if (isContentTypeFormURLEncoded(headers)) {
    return paramsSerializer(data);
  }

  if (isArray(data) || isObject(data)) {
    return JSON.stringify(data);
  }

  return data;
};

export const transformResponse = (data: any, headers: any) => {
  if (isContentTypeJSON(headers)) {
    return JSON.parse(data);
  }
  return data;
};

export const toUrl = (actor: IRequestActor, baseUrl = "") => {
  let axiosConfig = actor.requestConfig;
  if (actor.requestFromReq) {
    axiosConfig = actor.requestFromReq(actor.req);
  }

  return `${baseUrl || axiosConfig?.baseURL || ""}${axiosConfig?.url || ""}?${paramsSerializer(axiosConfig?.params)}`;
};

export const generateId = () => {
  return Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
};
