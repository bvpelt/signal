/**
 * Augment the Jasmine Matchers interface to include toHaveProperty.
 * This is often necessary when using strict type checking (strict: true)
 * or when the automatic type resolution for the Jasmine matchers is failing.
 */
declare namespace jasmine {
  interface Matchers<T> {
    /**
     * Checks if the object has the specified property.
     * This is a standard Jasmine matcher often used for testing object structure.
     * @param expected The property name to check for.
     */
    toHaveProperty(expected: string): boolean;
  }
}