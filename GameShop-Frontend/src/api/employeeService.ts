import { isAxiosError } from 'axios';
import apiService from '../config/axiosConfig';
import { EmployeeProfile } from '../model/employee/EmployeeProfile';

/**
 * Retrieves the Employee's profile details.
 * @param staffId The ID of the Employee to retrieve.
 * @returns A promise that resolves to the Employee's profile.
 */
export async function getEmployeeProfile(staffId: number): Promise<EmployeeProfile> {
    try {
      const response = await apiService.get(`/employees/${staffId}`); 
      return response.data as EmployeeProfile;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Employee account not found.');
        }
        if (error.response?.status === 500) {
          throw new Error(
            'Internal server error: Unable to retrieve Employee profile.'
          );
        }
      }
      throw new Error(
        'An unexpected error occurred while retrieving the Employee profile.'
      );
    }
  }  

/**
 * Updates the Employee's profile. Email cannot be changed.
 * @param staffId The ID of the Employee to update.
 * @param profileData The updated Employee profile data (name, phoneNumber, password).
 * @returns A promise that resolves to the updated Employee's profile.
 */
export async function updateEmployeeProfile(
    staffId: number,
    profileData: {
      email: string;
      name?: string;
      phoneNumber?: string;
      password?: string;
    }
  ): Promise<EmployeeProfile> {
    try {
      const response = await apiService.put(`/employees/${staffId}`, profileData);
      return response.data as EmployeeProfile;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Employee account not found.');
        }
        if (error.response?.status === 400) {
          throw new Error(
            'Invalid profile data. Ensure all fields meet the required criteria.'
          );
        }
        if (error.response?.status === 500) {
          throw new Error(
            'Internal server error: Unable to update Employee profile.'
          );
        }
      }
      throw new Error(
        'An unexpected error occurred while updating the Employee profile.'
      );
    }
  }
  