import { FormikConfig, FormikValues, useFormik } from "formik";
import {
  FieldHelperProps,
  FieldInputProps,
  FieldMetaProps,
  FormikErrors,
  FormikState,
  FormikTouched,
} from "formik/dist/types";
import React, {
  cloneElement,
  createContext,
  CSSProperties,
  isValidElement,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { FormControl, FormHelperText } from "@material-ui/core";
import { get, debounce } from "lodash";

export type Values = FormikValues;

export interface IFormik {
  initialValues: Values;
  initialErrors: FormikErrors<unknown>;
  initialTouched: FormikTouched<unknown>;
  initialStatus: any;
  handleBlur: {
    (e: React.FocusEvent<any>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T_1 = string | React.ChangeEvent<any>>(field: T_1): T_1 extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
  handleReset: (e: any) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void;
  resetForm: (nextState?: Partial<FormikState<Values>> | undefined) => void;
  setErrors: (errors: FormikErrors<Values>) => void;
  setFormikState: (stateOrCb: FormikState<Values> | ((state: FormikState<Values>) => FormikState<Values>)) => void;
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean | undefined,
  ) => Promise<FormikErrors<Values>> | Promise<void>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => Promise<FormikErrors<Values>> | Promise<void>;
  setFieldError: (field: string, value: string | undefined) => void;
  setStatus: (status: any) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setTouched: (
    touched: FormikTouched<Values>,
    shouldValidate?: boolean | undefined,
  ) => Promise<FormikErrors<Values>> | Promise<void>;
  setValues: (
    values: React.SetStateAction<Values>,
    shouldValidate?: boolean | undefined,
  ) => Promise<FormikErrors<Values>> | Promise<void>;
  submitForm: () => Promise<any>;
  validateForm: (values?: Values) => Promise<FormikErrors<Values>>;
  validateField: (name: string) => Promise<void> | Promise<string | undefined>;
  isValid: boolean;
  dirty: boolean;
  unregisterField: (name: string) => void;
  registerField: (name: string, { validate }: any) => void;
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  getFieldMeta: (name: string) => FieldMetaProps<any>;
  getFieldHelpers: (name: string) => FieldHelperProps<any>;
  validateOnBlur: boolean;
  validateOnChange: boolean;
  validateOnMount: boolean;
  values: Values;
  errors: FormikErrors<Values>;
  touched: FormikTouched<Values>;
  isSubmitting: boolean;
  isValidating: boolean;
  status?: any;
  submitCount: number;
}

export interface IBaseFormProps extends Omit<FormikConfig<Values>, "initialValues" | "onSubmit"> {
  initialValues?: Values;
  onSubmit?: FormikConfig<Values>["onSubmit"];
  formRef?: MutableRefObject<IFormik | undefined>;
}

export interface IBaseFormContext {
  form: IFormik;
}

const BaseFormContext = createContext<IBaseFormContext>({} as any);

export const useBaseForm = () => useContext(BaseFormContext);

export const BaseForm = ({ formRef, children, initialValues, onSubmit, ...formikProps }: IBaseFormProps) => {
  const formik = useFormik({
    initialValues: initialValues || {},
    onSubmit: (values, formikHelpers) => {
      if (onSubmit) {
        return onSubmit(values, formikHelpers);
      }
    },
    ...formikProps,
  });

  if (formRef) {
    formRef.current = formik;
  }

  return (
    <BaseFormContext.Provider value={{ form: formik }}>
      <form noValidate onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        {children}
      </form>
    </BaseFormContext.Provider>
  );
};

export const useItemProps = (name?: string) => {
  const { form } = useBaseForm();

  const error = useMemo(() => {
    if (!name) return true;
    if (form.submitCount > 0) {
      return Boolean(get(form.errors, name));
    }
    return get(form.touched, name) && Boolean(get(form.errors, name));
  }, [form.touched, form.errors, form.submitCount]);

  return {
    error,
    errorMsg: name ? get(form.errors, name) : "",
  };
};

export interface IBaseFormItemProps {
  children: ReactNode;
  //
  name?: string;
  directChange?: boolean;
  showHelperText?: boolean;
  //style
  fullWidth?: boolean;
  style?: CSSProperties;
  helperTextStyle?: CSSProperties;
}

export const BaseFormItem = ({
  children,
  //
  name,
  directChange,
  showHelperText = true,
  //
  fullWidth,
  style,
  helperTextStyle,
}: IBaseFormItemProps) => {
  const { form } = useBaseForm();

  const { error, errorMsg } = useItemProps(name);

  const debounceSetTouched = useCallback(
    debounce((name: string) => {
      name && form.setFieldTouched(name, true);
    }, 300),
    [],
  );

  const handleChange = useCallback((...e: any) => {
    debounceSetTouched(name!);
    if (directChange) {
      form.setFieldValue(name!, e[0], true);
    } else {
      form.handleChange(e[0]);
    }

    const originChange = get(children, ["props", "onChange"]);
    if (originChange) {
      originChange(...e);
    }
  }, []);

  if (!name || !isValidElement(children)) {
    return <>{children}</>;
  }

  return (
    <FormControl error={error} fullWidth={fullWidth} style={style}>
      {cloneElement(children, {
        id: name,
        name,
        error,
        value: get(form.values, name),
        onChange: handleChange,
      })}
      {showHelperText && <FormHelperText style={helperTextStyle}>{error ? errorMsg || " " : " "}</FormHelperText>}
    </FormControl>
  );
};
