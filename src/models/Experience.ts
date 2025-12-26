import { getDatabase } from "@/lib/mongodb";
import { Experience } from "./types";
import { Collection, ObjectId } from "mongodb";

const COLLECTION_NAME = "experiences";

export class ExperienceModel {
  private static async getCollection(): Promise<Collection> {
    const db = await getDatabase();
    return db.collection(COLLECTION_NAME);
  }

  static async findAll(): Promise<Experience[]> {
    const collection = await this.getCollection();
    const experiences = await collection.find({}).toArray();

    return experiences.map((exp) => ({
      _id: exp._id.toString(),
      title: exp.title,
      context: exp.context,
      date: exp.date,
      description: exp.description,
      details: exp.details,
      article: exp.article,
      techStack: exp.techStack,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    }));
  }

  static async findById(id: string): Promise<Experience | null> {
    const collection = await this.getCollection();
    const experience = await collection.findOne({ _id: new ObjectId(id) });

    if (!experience) return null;

    return {
      _id: experience._id.toString(),
      title: experience.title,
      context: experience.context,
      date: experience.date,
      description: experience.description,
      details: experience.details,
      article: experience.article,
      techStack: experience.techStack,
      createdAt: experience.createdAt,
      updatedAt: experience.updatedAt,
    };
  }

  static async create(
    experienceData: Omit<Experience, "_id" | "createdAt" | "updatedAt">
  ): Promise<Experience> {
    const collection = await this.getCollection();
    const now = new Date();

    const result = await collection.insertOne({
      ...experienceData,
      createdAt: now,
      updatedAt: now,
    });

    return {
      _id: result.insertedId.toString(),
      ...experienceData,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async update(
    id: string,
    updates: Partial<Omit<Experience, "_id" | "createdAt">>
  ): Promise<Experience | null> {
    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) return null;

    return {
      _id: result._id.toString(),
      title: result.title,
      context: result.context,
      date: result.date,
      description: result.description,
      details: result.details,
      article: result.article,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
