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

export interface FormData {
  name: string;
  dateOfBirth: {
    day: number;
    month: string;
    year: number;
  };
  gender: Gender;
  graduatedFrom: string;
  currentlyWorking: string;
  password: string;
}

type Gender = "prefer-not-to-say" | "MALE" | "FEMALE" | "OTHER";

interface InputContainerProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const InputContainer: React.FC<InputContainerProps> = ({ label, children, error }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const NumberSelector: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  placeholder: string;
}> = ({ value, min, max, onChange, placeholder }) => {
  const [showModal, setShowModal] = useState(false);
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => max - i);

  return (
    <>
      <TouchableOpacity
        style={styles.dateComponent}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.dateComponentText}>{value || placeholder}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{placeholder}</Text>
            <FlatList
              data={numbers}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    value === item && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onChange(item);
                    setShowModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      value === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const MonthSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dateComponent}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.dateComponentText}>{value || "Month"}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <FlatList
              data={months}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    value === item && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onChange(item);
                    setShowModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      value === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Add validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  dateOfBirth: z.object({
    day: z.number().min(1).max(31),
    month: z.string().refine((val) => months.includes(val), "Please select a valid month"),
    year: z.number().min(1900).max(new Date().getFullYear()),
  }).refine(
    (data) => {
      const date = new Date(data.year, months.indexOf(data.month), data.day);
      return date instanceof Date && !isNaN(date.getTime());
    },
    "Please enter a valid date"
  ),
  gender: z.enum(["prefer-not-to-say", "MALE", "FEMALE", "OTHER"]),
  graduatedFrom: z.string().min(2, "Institution name must be at least 2 characters").max(100),
  currentlyWorking: z.string().min(2, "Current role must be at least 2 characters").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

type ValidationErrors = {
  [K in keyof FormData]?: string;
};

export default function Signup(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dateOfBirth: {
      day: 0,
      month: "",
      year: 0,
    },
    gender: "OTHER",
    graduatedFrom: "",
    currentlyWorking: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path as keyof FormData] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const transformedData = {
        ...formData,
        dateOfBirth: new Date(
          formData.dateOfBirth.year,
          months.indexOf(formData.dateOfBirth.month),
          formData.dateOfBirth.day
        )
      };

      console.log("Form submitted with data:", transformedData);

      const res = await fetch("api/createUser", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify(transformedData),
      });
      const data = await res.json();

      if (data.status === 200) {
        router.push("/(tabs)")
      }
    } catch (error) {
      console.error(error);
      // Handle error here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextInput = (
    field: keyof Pick<FormData, "name" | "graduatedFrom" | "currentlyWorking" | "password">
  ) => (text: string): void => {
    setFormData((prev) => ({ ...prev, [field]: text }));
  };

  const handleGenderChange = (value: Gender): void => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>

        {/* Name Input */}
        <InputContainer label="Name" error={errors.name}>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={handleTextInput("name")}
            placeholder="Enter your full name"
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
                errors.password && styles.inputError
              ]}
              value={formData.password}
              onChangeText={handleTextInput("password")}
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
          {formData.password && (
            <View style={styles.passwordRequirements}>
              <Text style={styles.passwordRequirementText}>
                Password must contain:
              </Text>
              <Text style={[
                styles.passwordRequirementText,
                formData.password.length >= 8 && styles.passwordRequirementMet
              ]}>
                • At least 8 characters
              </Text>
              <Text style={[
                styles.passwordRequirementText,
                /[A-Z]/.test(formData.password) && styles.passwordRequirementMet
              ]}>
                • One uppercase letter
              </Text>
              <Text style={[
                styles.passwordRequirementText,
                /[a-z]/.test(formData.password) && styles.passwordRequirementMet
              ]}>
                • One lowercase letter
              </Text>
              <Text style={[
                styles.passwordRequirementText,
                /[0-9]/.test(formData.password) && styles.passwordRequirementMet
              ]}>
                • One number
              </Text>
              <Text style={[
                styles.passwordRequirementText,
                /[^A-Za-z0-9]/.test(formData.password) && styles.passwordRequirementMet
              ]}>
                • One special character
              </Text>
            </View>
          )}
        </InputContainer>

        {/* Date of Birth */}
        <InputContainer label="Date of Birth" error={errors.dateOfBirth}>
          <View style={styles.dateContainer}>
            <View style={styles.dateWrapper}>
              <NumberSelector
                value={formData.dateOfBirth.day}
                min={1}
                max={31}
                onChange={(day) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateOfBirth: { ...prev.dateOfBirth, day },
                  }))
                }
                placeholder="Day"
              />
            </View>
            <View style={styles.dateWrapper}>
              <MonthSelector
                value={formData.dateOfBirth.month}
                onChange={(month) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateOfBirth: { ...prev.dateOfBirth, month },
                  }))
                }
              />
            </View>
            <View style={styles.dateWrapper}>
              <NumberSelector
                value={formData.dateOfBirth.year}
                min={1900}
                max={new Date().getFullYear()}
                onChange={(year) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateOfBirth: { ...prev.dateOfBirth, year },
                  }))
                }
                placeholder="Year"
              />
            </View>
          </View>
        </InputContainer>

        {/* Gender Selection */}
        <InputContainer label="Gender" error={errors.gender}>
          <View style={styles.pickerContainer}>
            <Picker<Gender>
              selectedValue={formData.gender}
              onValueChange={handleGenderChange}
              style={styles.picker}
            >
              <Picker.Item label="Male" value="MALE" />
              <Picker.Item label="Female" value="FEMALE" />
              <Picker.Item label="Other" value="OTHER" />
            </Picker>
          </View>
        </InputContainer>

        {/* Graduated From */}
        <InputContainer label="Graduated From" error={errors.graduatedFrom}>
          <TextInput
            style={[styles.input, errors.graduatedFrom && styles.inputError]}
            value={formData.graduatedFrom}
            onChangeText={handleTextInput("graduatedFrom")}
            placeholder="Enter your educational institution"
            placeholderTextColor="#666"
          />
        </InputContainer>

        {/* Currently Working */}
        <InputContainer label="Currently Working" error={errors.currentlyWorking}>
          <TextInput
            style={[styles.input, errors.currentlyWorking && styles.inputError]}
            value={formData.currentlyWorking}
            onChangeText={handleTextInput("currentlyWorking")}
            placeholder="Enter your current role"
            placeholderTextColor="#666"
          />
        </InputContainer>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
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
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  passwordVisibilityButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  passwordVisibilityButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  passwordRequirements: {
    marginTop: 8,
    paddingLeft: 4,
  },
  passwordRequirementText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  passwordRequirementMet: {
    color: '#34C759',
  },
});
