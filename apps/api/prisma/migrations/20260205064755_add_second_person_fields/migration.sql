-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "dateOfBirthSecondPerson" TIMESTAMP(3),
ADD COLUMN     "dateOfDeathSecondPerson" TIMESTAMP(3),
ADD COLUMN     "firstNameSecondPerson" TEXT,
ADD COLUMN     "lastNameSecondPerson" TEXT,
ADD COLUMN     "middleNameSecondPerson" TEXT;
