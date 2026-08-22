package com.aiplacement.backend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AdminEndpointPreAuthorizeGuardTest {

    @Test
    @DisplayName("Assert all /api/v1/admin/** controller endpoints have explicit @PreAuthorize annotations")
    void assertAllAdminEndpointsHavePreAuthorize() throws Exception {
        String packageName = "com.aiplacement.backend.controller.admin";
        List<Class<?>> adminControllerClasses = getClassesInPackage(packageName);

        List<String> missingPreAuthorizeErrors = new ArrayList<>();

        for (Class<?> clazz : adminControllerClasses) {
            // Skip AdminAuthController public authentication endpoints (login, refresh)
            if (clazz.getSimpleName().equals("AdminAuthController")) {
                continue;
            }

            boolean isController = clazz.isAnnotationPresent(RestController.class) || clazz.isAnnotationPresent(Controller.class);
            if (!isController) {
                continue;
            }

            boolean classHasPreAuthorize = clazz.isAnnotationPresent(PreAuthorize.class);

            for (Method method : clazz.getDeclaredMethods()) {
                boolean isEndpoint = method.isAnnotationPresent(GetMapping.class)
                        || method.isAnnotationPresent(PostMapping.class)
                        || method.isAnnotationPresent(PutMapping.class)
                        || method.isAnnotationPresent(DeleteMapping.class)
                        || method.isAnnotationPresent(PatchMapping.class)
                        || method.isAnnotationPresent(RequestMapping.class);

                if (isEndpoint) {
                    boolean methodHasPreAuthorize = method.isAnnotationPresent(PreAuthorize.class);
                    if (!methodHasPreAuthorize && !classHasPreAuthorize) {
                        missingPreAuthorizeErrors.add(clazz.getSimpleName() + "." + method.getName() + "()");
                    }
                }
            }
        }

        assertTrue(
                missingPreAuthorizeErrors.isEmpty(),
                "SECURITY GUARD FAIL-SAFE VIOLATION: The following admin controller endpoints lack an explicit @PreAuthorize annotation: "
                        + missingPreAuthorizeErrors
                        + ". Every endpoint under /api/v1/admin/** must have an explicit @PreAuthorize annotation to prevent unintended fail-open filter-chain access."
        );
    }

    private List<Class<?>> getClassesInPackage(String packageName) throws Exception {
        List<Class<?>> classes = new ArrayList<>();
        String path = packageName.replace('.', '/');
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        URL resource = classLoader.getResource(path);
        if (resource != null) {
            File directory = new File(resource.getFile());
            if (directory.exists()) {
                for (File file : directory.listFiles()) {
                    if (file.getName().endsWith(".class")) {
                        String className = packageName + '.' + file.getName().substring(0, file.getName().length() - 6);
                        classes.add(Class.forName(className));
                    }
                }
            }
        }
        return classes;
    }
}
