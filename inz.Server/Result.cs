namespace inz.Server;

public class Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T? Value { get; }
    public Error? Error { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
        Error = null;
    }

    private Result(Error error)
    {
        IsSuccess = false;
        Value = default;
        Error = error;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);
}

public record Error(string Message)
{
    public static readonly Error TokenExpired = new("Token expired");
    public static readonly Error InvalidToken = new("Invalid token");

    public static readonly Error FileNotFound = new("File not found");
    public static readonly Error FileExists = new("File already exists");
}