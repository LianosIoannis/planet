import { prisma } from "./prisma/seeds/seed_client.js";

const getCustomers = async () => {
    return prisma.customer.findMany();
}

getCustomers().then(console.dir);