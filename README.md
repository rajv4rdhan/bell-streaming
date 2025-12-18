{container=~".+"}


```
Get-Content .env | 
  Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | 
  ForEach-Object {
    $parts = $_ -split '=', 2
    "ParameterKey=$($parts[0].Trim()),ParameterValue=$($parts[1].Trim())"
  } | 
  Set-Content params.txt
  ```

  export env