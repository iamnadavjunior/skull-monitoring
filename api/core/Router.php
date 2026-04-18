<?php
class Router {
    private $routes = [];

    public function get(string $path, callable $handler): void {
        $this->routes['GET'][$path] = $handler;
    }

    public function post(string $path, callable $handler): void {
        $this->routes['POST'][$path] = $handler;
    }

    public function put(string $path, callable $handler): void {
        $this->routes['PUT'][$path] = $handler;
    }

    public function delete(string $path, callable $handler): void {
        $this->routes['DELETE'][$path] = $handler;
    }

    public function resolve(string $method, string $uri): void {
        $uri = '/' . trim($uri, '/');
        $method = strtoupper($method);

        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $route);
            if (preg_match('#^' . $pattern . '$#', $uri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                call_user_func($handler, $params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
    }
}
