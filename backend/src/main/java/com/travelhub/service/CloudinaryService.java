package com.travelhub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload a single media file (image or video) to Cloudinary.
     * Uses resource_type "auto" so Cloudinary auto-detects the file type.
     *
     * @param file   the multipart file to upload
     * @param folder the Cloudinary folder to store the file in (e.g. "packages", "profiles")
     * @return the secure URL of the uploaded file
     */
    @SuppressWarnings("unchecked")
    public String uploadMedia(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "pooltrip/" + folder,
                            "resource_type", "auto"
                    ));
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Media uploaded to Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Failed to upload media to Cloudinary", e);
            throw new RuntimeException("Failed to upload media: " + e.getMessage(), e);
        }
    }

    /**
     * Upload multiple media files (images and/or videos) to Cloudinary.
     *
     * @param files  the multipart files to upload
     * @param folder the Cloudinary folder
     * @return list of secure URLs
     */
    public List<String> uploadMediaFiles(MultipartFile[] files, String folder) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                urls.add(uploadMedia(file, folder));
            }
        }
        return urls;
    }

    /**
     * Delete a media file from Cloudinary by its public ID.
     *
     * @param publicId the Cloudinary public ID
     */
    @SuppressWarnings("unchecked")
    public void deleteMedia(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Media deleted from Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.error("Failed to delete media from Cloudinary: {}", publicId, e);
        }
    }
}
