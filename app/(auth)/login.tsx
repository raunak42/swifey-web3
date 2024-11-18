import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { z } from "zod";
import { startSession } from "../../utils/session";
import { BASE_NET } from "@/constants/urls";

interface LoginFormData {
  name: string;
  password: string;
}

const loginSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(1, "Password is required"),
});

interface InputContainerProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

const InputContainer: React.FC<InputContainerProps> = ({
  label,
  children,
  error,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default function Login(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    name: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    try {
      loginSchema.parse(formData);
      setIsSubmitting(true);

      const res = await fetch(`${BASE_NET}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("data:", data);

      if (data.status === 401) {
        setErrors({
          name: "Invalid credentials",
          password: "Invalid credentials",
        });
        return;
      }

      if (data.status === 200 && data.userId) {
        await startSession({
          userId: data.userId,
          name: data.name,
        });
        router.push("/(tabs)");
      } else {
        setErrors({
          name: "Login failed",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        {/* Name Input */}
        <InputContainer label="Name" error={errors.name}>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter your name"
            placeholderTextColor="#666"
          />
        </InputContainer>

        {/* Password Input */}
        <InputContainer label="Password" error={errors.password}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                errors.password && styles.inputError,
              ]}
              value={formData.password}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, password: text }))
              }
              placeholder="Enter your password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordVisibilityButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.passwordVisibilityButtonText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </InputContainer>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateComponent: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  dateComponentText: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "white",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    backgroundColor: "white",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemSelected: {
    backgroundColor: "#007AFF",
  },
  modalItemText: {
    fontSize: 16,
    textAlign: "center",
  },
  modalItemTextSelected: {
    color: "white",
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  modalCloseButtonText: {
    textAlign: "center",
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginTop: 5,
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  passwordVisibilityButton: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  passwordVisibilityButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  passwordRequirements: {
    marginTop: 8,
    paddingLeft: 4,
  },
  passwordRequirementText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  passwordRequirementMet: {
    color: "#34C759",
  },
});
