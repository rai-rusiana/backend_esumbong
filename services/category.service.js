import prisma from "../lib/prisma.js"

export const createCategory = async (category) => {
  return await prisma.category.create({
    data: {
      name: category.name,
      description: category.description,
      type: category.type
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

export const getAllCategory = async (type) => {
  return await prisma.category.findMany({
    where: type ? { type: type}: {},
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};
