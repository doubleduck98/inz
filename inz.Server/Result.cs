namespace inz.Server;

public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error? Error { get; }

    protected Result(bool isSuccess, Error? error = null)
    {
        switch (isSuccess)
        {
            case true when error != null:
            case false when error == null:
                throw new InvalidOperationException("Error not supplied when failing");

            default:
                IsSuccess = isSuccess;
                Error = error;
                break;
        }
    }

    public static Result Success() => new(true);
    public static Result Failure(Error error) => new(false, error);
    public static Result<T> Success<T>(T value) => new(value, true, null);
    public static Result<T> Failure<T>(Error error) => new(default, false, error);
}

public class Result<T> : Result
{
    public T? Value { get; }

    protected internal Result(T? value, bool isSuccess, Error? error) : base(isSuccess, error) => Value = value;

    public static implicit operator Result<T>(T value) => new(value, true, null);
}

public record Error(string Message)
{
    public static readonly Error TokenExpired = new("Token expired");
    public static readonly Error InvalidToken = new("Invalid token");

    public static readonly Error FileNotFound = new("File not found");
    public static readonly Error FileAlreadyExists = new("File already exists");
    public static readonly Error FileNotPresent = new("File not present on server");
}