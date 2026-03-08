Trip
   uid: string;
   tripDate: Date;
   endDate?: Date;
   vehicle: Vehicle
   driver: Driver;
   route: Route;
   revenue: number;
   income: number;
   cargoTypeId:string (One to one relationship with cargoType)
   expenses: TripExpense[];
   status: enum (pending | inprogress | completed | cancelled);
   createdAt: Date;
   updatedAt: Date;

Trip expenses
   uid: string;
   trip:Trip;
   expense:Expense;
   amount: number;
   receiptAttachment?: File;
   date: Date;
   createdAt: Date;


Vehicle
 Id: PrimaryGenerated
 uid: string;
 registrationNo: string;
 registrationYear?: number;
 tankCapacity: number;
 mileagePerFullTank: number;
 permits: VehiclePermit[];
 isActive: boolean;
 createdAt: Date;
 updatedAt: Date;





Vehicle permit
 id: string;
 description: string;
 startDate: Date;
 endDate: Date;
 attachment?: string;


Driver
 uid: string;
 firstName: string;
 lastName: string;
 email?: string;
 phone: string;
 address?: string;
 dateOfBirth?: Date;
 licenseNumber: string;
 licenseIssueDate: Date;
 licenseExpiryDate: Date;
 licenseClass: string;
 licenseFrontPagePhoto?: File;
 driverPhoto?: string;
 isActive: boolean;
 createdAt: Date;
 updatedAt: Date;


Route
 uid: string;
 name: string;
 mileage: number;
 startLocation?: string;
 endLocation?: string;
 estimatedDuration?: number;
 isActive: boolean;
 createdAt: Date;
 updatedAt: Date;




Expense
 uid: string;
 name: string;
 Category:enum (GENERAL | OTHER);
 description?: string;
 isActive?: boolean;
 createdAt: Date;
 updatedAt: Date;


Cargo Type
	Uid:string
   	Name: string
	isActive: boolean

Notes

One trip is associated with one vehicle, one driver, one cargo type and many trip expenses.
One driver,vehicle or cargo type can appear into many trips.
One trip expense is associated with one expense.
One expense can appear into many trip expenses

