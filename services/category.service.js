import prisma from "../lib/prisma.js"

export const createCategory = async (category) => {
  return await prisma.category.create({
    data: {
      name: category.name,
      description: category.description,
    }
  });
};

export const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: {
      id,
    },
  });
};

export const getAllCategory = async () => {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
};
