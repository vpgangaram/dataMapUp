export interface EVData {
    VIN: string;
    City: string;
    State: string;
    ModelYear: string;
    Make: string;
    Model: string;
    VehicleType: string;
    Latitude: string;
    Longitude: string;
    [key: string]: string; // For any additional fields in the CSV
} 