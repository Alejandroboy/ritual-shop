export {};

declare global {
  interface Window {
    orderData: {
      number: number;
      dateAccepted: string;
      dateDelivery: string;
      approveNeeded: boolean;
      comment: string;
      material: string;
      size: string;
      background: string;
      frame: string;
      hasHoles: boolean;
      deceased: {
        lastName: string;
        firstName: string;
        middleName: string;
        birthDate: string;
        deathDate: string;
      };
    };
  }
}
