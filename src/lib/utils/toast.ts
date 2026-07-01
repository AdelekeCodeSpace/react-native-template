import { Alert } from "react-native";

type Params = {
  message: string;
  description?: string;
};

export const notifySuccess = ({ message, description }: Params) => {
  Alert.alert("Success", description ? `${message}\n${description}` : message);
};

export const notifyError = ({ message, description }: Params) => {
  Alert.alert("Error", description ? `${message}\n${description}` : message);
};

export const notifyInfo = ({ message, description }: Params) => {
  Alert.alert("Info", description ? `${message}\n${description}` : message);
};
