/**
 * Utility functions for processing gRPC-Web text streams
 */

/**
 * Replaces gRPC-Web prefix patterns with newline and opening brace
 * Handles patterns like:
 * - \x00\x00\x00\x00u{
 * - \x00\x00\x00\x00!{
 * - \x00\x00\x00\x11B{
 * - \x00\x00\x00\x00�{
 * 
 * @param input The input string containing gRPC-Web patterns
 * @returns The cleaned string with patterns replaced by \n{
 */
export function replaceGrpcWebPatterns(input: string): string {
    // This regex matches patterns like \x00\x00\x00\x00 or \x00\x00\x00\x11
    // followed by any character (including special chars) and then an opening brace
    // and replaces it with \n{
    const regex = /\x00\x00\x00[\x00-\xFF]{1}.{1}?{/g;
    return input.replace(regex, '\n{');
}

/**
 * More specific version that only replaces the exact patterns mentioned
 * \x00\x00\x00\x00 followed by any single character then {
 * 
 * @param input The input string containing null byte patterns
 * @returns The cleaned string with patterns replaced by \n{
 */
export function replaceNullBytePatterns(input: string): string {
    const regex = /\x00\x00\x00\x00.{1}?{/g;
    return input.replace(regex, '\n{');
}

/**
 * Generalized version that handles any 4-byte prefix followed by a character and {
 * 
 * @param input The input string containing 4-byte patterns
 * @returns The cleaned string with patterns replaced by \n{
 */
export function replaceFourBytePatterns(input: string): string {
    const regex = /[\x00-\xFF]{4}.{1}?{/g;
    return input.replace(regex, '\n{');
}